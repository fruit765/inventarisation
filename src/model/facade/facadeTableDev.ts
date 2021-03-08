import { Transaction } from "knex"
import _ from "lodash"
import { CreateErr } from "../class/createErr"
import Category from "../orm/category"
import Responsibility from "../orm/responsibility"
import Ajv from "ajv"
import Status from "../orm/status"
import CyrillicToTranslit from "cyrillic-to-translit-js"
import { recValidate } from "../class/recValidate"
import { FacadeTable } from "./facadeTable"
import Device from "../orm/device"

const ajv = new Ajv({ errorDataPath: 'property', coerceTypes: true, removeAdditional: "all" })
const cyrillicToTranslit = new CyrillicToTranslit()

export class FacadeTableDev extends FacadeTable {
    private handleErr: CreateErr

    constructor(tableClass: any, actorId: number, options: { isSaveHistory?: boolean }) {
        super(tableClass, actorId, options)
        this.handleErr = new CreateErr()
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
        const valid = await new recValidate(dataClone, this.tableName, "insert").validate()
        dataClone.id = valid.getId()
        dataClone.inv_number = dataClone.inv_number ?? catName4Translit + valid.getId()
        return super.insert(dataClone, trxOpt)
    }

    /**
     * Обновляет данные в таблице возвражает id записи
     * Производит валидацию спецификации оборудования
     */
    async patch(data: any, trxOpt?: Transaction<any, any>) {
        const dataClone = _.cloneDeep(data)
        const categoryId = data.category_id ?? (await Device.query().findById(data.id)).category_id
        await this.specValidation(categoryId, dataClone.specifications)
        return super.patch(dataClone, trxOpt)
    }

     /**Привязывает оборудование к пользователю*/
      async bind(devId: number, userId: number) {
        const unconfirm = (await this.getUnconfirm(devId))[0]
        const unconfirmStatus = unconfirm.status
        if (unconfirmStatus !== "stock") {
            throw this.handleErr.idWrong()
        }
        const status_id = await Status.query().where("status", "given").first()
        return this.patchAndFetch({ id: devId, user_id: userId, status_id: status_id })
    }

    /**Отвязывает оборудование от пользователя*/
    async remove(devId: number, userId: number) {
        const unconfirm = (await this.getUnconfirm(devId))[0]
        const unconfirmStatus = unconfirm.status
        if (unconfirmStatus !== "given") {
            throw this.handleErr.idWrong()
        }
        if (!await this.isUserWarehouseResponsible(userId)) {
            throw this.handleErr.userIdWrong()
        }
        const status_id = await Status.query().where("status", "stock").first()
        return this.patchAndFetch({ id: devId, user_id: userId, status_id: status_id })
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
            throw this.handleErr.createError(400, {message:err.errors})
        })
        return spec
    }

    /**Проверяет является ли юзер ответственным за склад*/
    private async isUserWarehouseResponsible(userId: number) {
        const resp = <any>await Responsibility.query().findById(userId)
        return Boolean(resp.warehouseResponsible)
    }
}