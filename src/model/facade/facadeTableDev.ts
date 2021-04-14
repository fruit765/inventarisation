import { Transaction } from "knex"
import _ from "lodash"
import Category from "../orm/category"
import Responsibility from "../orm/responsibility"
import Ajv from "ajv"
import Status from "../orm/status"
import CyrillicToTranslit from "cyrillic-to-translit-js"
import RecValidate from "../class/recValidate"
import { FacadeTable } from "./facadeTable"
import knex from "../orm/knexConf"
import { startTransOpt } from '../libs/transaction'

const ajv = new Ajv({ errorDataPath: 'property', coerceTypes: true, removeAdditional: "all" })
const cyrillicToTranslit = new CyrillicToTranslit()

export class FacadeTableDev extends FacadeTable {

    constructor(actorId: number, options?: { isSaveHistory?: boolean }) {
        super("Device", actorId, options)
    }
    /**
     * Добовляет данные в таблицу возвражает id записи
     * Так же проверяет на привязку к ответственному по складу
     * Вставляет статус на складе
     * Генерирует инвентарный номер
     * Производит валидацию спецификации оборудования
     */
    async insert(data: any, trxOpt?: Transaction<any, any>) {
        if (!await this.isUserWarehouseResponsible(data.user_id)) {
            throw this.handleErr.userIdWrong()
        }
        const dataClone = _.cloneDeep(data)
        await this.specValidation(data.category_id, dataClone.specifications)
        const status_id: number = (await Status.query().where("status", "stock").first()).id
        const category: any = await Category.query().findById(dataClone.category_id)
        const catName4 = String(category.category).slice(0, 4)
        const catName4Translit = cyrillicToTranslit.transform(catName4, "-")
        dataClone.status_id = dataClone.status_id ?? status_id
        const valid = await new RecValidate(dataClone, this.tableName, "insert").validate()
        dataClone.id = valid.getId()
        dataClone.inv_number = dataClone.inv_number ?? category.inv_prefix ? category.inv_prefix + valid.getId() : catName4Translit + valid.getId()
        return super.insert(dataClone, trxOpt)
    }

    /**
     * Обновляет данные в таблице возвражает id записи
     * Производит валидацию спецификации оборудования
     */
    async patch(data: any, trxOpt?: Transaction<any, any>) {
        const dataClone = _.cloneDeep(data)
        const categoryId = data.category_id ?? (await <Promise<any>>knex(this.tableName).where("id", data.id).first()).category_id
        await this.specValidation(categoryId, dataClone.specifications)
        return super.patch(dataClone, trxOpt)
    }

    /**Привязывает оборудование к пользователю*/
    async bind(devId: number, userId: number, trxOpt?: Transaction<any, any>): Promise<any[]> {
        return startTransOpt(trxOpt, async (trx) => {
            const unconfirm = (await this.getUnconfirm(devId))[0]
            const unconfirmStatus = unconfirm.status
            const category = await <Promise<any>>knex("category").where("id", unconfirm.category_id).first()

            if (unconfirmStatus !== "stock" || unconfirm.parent_id !== null || category.is_attached !== 1 ) {
                throw this.handleErr.idWrong()
            }

            let childDevRes: any[] = []
            const childDev = await <Promise<any[]>>knex(this.tableName).transacting(trx).where("parent_id", devId)
            if (childDev.length) {
                for (let value of childDev) {
                    childDevRes = childDevRes.concat(await this.bind(value.id, userId, trx))
                }
            }
            const status = await Status.query().where("status", "given").first()
            const res = await this.patchAndFetch({ id: devId, user_id: userId, status_id: status.id }, trx)
            return childDevRes.concat(res)
        })
    }

    /**Отвязывает оборудование от пользователя*/
    async remove(devId: number, userId?: number, trxOpt?: Transaction<any, any>): Promise<any[]> {
        return startTransOpt(trxOpt, async (trx) => {
            if (userId == undefined) {
                userId = await this.getLastWarResp(devId)
            }
            const unconfirm = (await this.getUnconfirm(devId))[0]
            const unconfirmStatus = unconfirm.status

            if (unconfirmStatus !== "given" || unconfirm.parent_id !== null) {
                throw this.handleErr.idWrong()
            }

            if (!await this.isUserWarehouseResponsible(userId)) {
                throw this.handleErr.userIdWrong()
            }

            let childDevRes: any[] = []
            const childDev = await <Promise<any[]>>knex(this.tableName).transacting(trx).where("parent_id", devId)
            if (childDev.length) {
                for (let value of childDev) {
                    childDevRes = childDevRes.concat(await this.remove(value.id, userId, trx))
                }
            }

            const status = await Status.query().where("status", "stock").first()
            const res = await this.patchAndFetch({ id: devId, user_id: userId, status_id: status.id }, trx)
            return childDevRes.concat(res)
        })
    }

    /**Возвращает последнего ответственного за склад для устройства */
    async getLastWarResp(devId: number) {
        return <number>(<any>await Responsibility.query().where("warehouseResponsible", 1).first()).id
    }

    /**Проверка спецификации оборудования на схему в категории
    * @param spec мутирует этот объект*/
    async specValidation(catId: number, spec: any = {}) {
        const catRow = <any>await Category.query().findById(catId)
        const schema = Object.assign(catRow.schema, { $async: true })
        const validate = ajv.compile(schema)
        const valid = validate(spec)
        if (typeof valid === "boolean") {
            throw this.handleErr.internalServerError("the spec in the category has no property $ async: true")
        }
        await valid.then(null, err => {
            if (!(err instanceof Ajv.ValidationError)) throw err
            for (let key in err.errors) {
                err.errors[key].dataPath = ".specifications" + err.errors[key].dataPath
            }
            throw this.handleErr.createError(400, { message: err.errors })
        })
        return spec
    }

    /**Проверяет является ли юзер ответственным за склад*/
    private async isUserWarehouseResponsible(userId: number) {
        const resp = <any>await Responsibility.query().findById(userId)
        return Boolean(resp?.warehouseResponsible)
    }

    /**Привязывает одно оборудование к другому, формирует составное оборудование */
    async bindSubDevice(id: number, ids: number[], trxOpt?: Transaction<any, any>) {
        return startTransOpt(trxOpt, async (trx) => {
            const unconfirm = await this.getUnconfirm(ids.concat(id))
            const unconfirmIndex = _.keyBy(unconfirm, "id")
            const mainStatus = unconfirmIndex[id].status
            const mainUser = unconfirmIndex[id].user_id
            const mainStatusId = unconfirmIndex[id].status_id
            const res = []

            if (mainStatus === "given") {
                ids.forEach(val => {
                    const valStatus = unconfirmIndex[val].status
                    const valUser = unconfirmIndex[val].user_id
                    if (!(valStatus === "given" && valUser === mainUser) && valStatus !== "stock") {
                        console.log(unconfirmIndex[val])
                        throw this.handleErr.bindSubDevNotAllowed()
                    }
                })
            } else if (mainStatus === "stock") {
                ids.forEach(val => {
                    const valStatus = unconfirmIndex[val].status
                    if (valStatus !== "given" && valStatus !== "stock") {
                        throw this.handleErr.bindSubDevNotAllowed()
                    }
                })
            } else {
                throw this.handleErr.bindSubDevNotAllowed()
            }

            for (let subId of ids) {
                const x = await this.patchAndFetch({ id: subId, user_id: mainUser, status_id: mainStatusId, parent_id: id }, trx)
                res.push(x)
            }
            return res
        })
    }

    /**Отвязывает одно оборудование от другого */
    async unbindSubDevice(ids: number[], trxOpt?: Transaction<any, any>): Promise<any[]> {
        return startTransOpt(trxOpt, async (trx) => {
            const unconfirm = await this.getUnconfirm(ids)
            const unconfirmIndex = _.keyBy(unconfirm, "id")
            const status = await Status.query().where("status", "stock").first()
            const res = []
            for (let id of ids) {
                let userid: number
                if (unconfirmIndex[id].status === "given") {
                    userid = await this.getLastWarResp(id)
                } else if (unconfirmIndex[id].status === "stock") {
                    userid = unconfirmIndex[id].user_id
                } else {
                    throw this.handleErr.unbindSubDevNotAllowed()
                }
                const x = await this.patchAndFetch({ id: id, parent_id: null, status_id: status.id, user_id: userid }, trx)
                res.push(x)
            }
            return res
        })
    }
}