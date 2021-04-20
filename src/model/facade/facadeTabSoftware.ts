import { FacadeTable } from './facadeTable'
import knex from '../orm/knexConf'
import _ from 'lodash'
import SoftwareTypeSingle from '../class/software/SoftwareTypeSingle'
import SoftwareTypeMulti from './../class/software/SoftwareTypeMulti'
import { classInterface } from '../../type/type'
import Ajv from "ajv"
import { Transaction } from 'knex';
const ajv = new Ajv({ errorDataPath: 'property', coerceTypes: true, removeAdditional: "all" })

export default class FacadeTabSoftware extends FacadeTable {
    constructor(actorId: number, options?: { isSaveHistory?: boolean }) {
        super("software", actorId, options)
    }

    private async createSoftwareClasses(id?: number | number[]): Promise<classInterface.softwareConnector[]> {
        if (typeof id === "number") {
            id = [id]
        }
        const unconfirm = await super.getUnconfirm(id)
        const softwareCatsIds = unconfirm.map(x => x.software_category_id)
        const softwareCats = await <Promise<any[]>>knex("software_category").whereIn("id", softwareCatsIds)
        const catTypesIds = softwareCats.map(x => x.software_cat_type_id)
        const catTypes = await <Promise<any[]>>knex("software_cat_type").whereIn("id", catTypesIds)
        const softOwnersIds = unconfirm.map(x => x.id)
        const softOwners = await <Promise<any[]>>knex("software_owner").whereIn("software_id", softOwnersIds)

        const softwareCatIndex = _.keyBy(softwareCats, "id")
        const catTypeIndex = _.keyBy(catTypes, "id")
        const softOwnersIndex = _.groupBy(softOwners, x => x.software_id)

        return unconfirm.map(elem => {
            const softwareCat = softwareCatIndex[elem.software_category_id]
            const catType = catTypeIndex[softwareCat.software_cat_type_id]
            const softOwner = softOwnersIndex[elem.id] ?? []
            if (catType.name === "single") {
                return new SoftwareTypeSingle(elem, softOwner)
            } else if (catType.name === "multi") {
                return new SoftwareTypeMulti(elem, softOwner)
            } else {
                throw this.handleErr.internalServerError("wrong software type")
            }
        })
    }

    /**Проверка спецификации оборудования на схему в категории
    * @param spec мутирует этот объект*/
    async specValidation(catId: number, spec: any = {}) {
        const catRow = await <Promise<any>>knex("software_category").where("id", catId).first()
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

    /**
     * Обновляет данные в таблице возвражает id записи
     * Производит валидацию спецификации по категории
     */
    async patch(data: any, trxOpt?: Transaction<any, any>) {
        const dataClone = _.cloneDeep(data)
        const categoryId = data.software_category_id ?? (await <Promise<any>>knex(this.tableName).where("id", data.id).first()).software_category_id
        await this.specValidation(categoryId, dataClone.specifications)
        return super.patch(dataClone, trxOpt)
    }

    /**
     * Добовляет данные в таблицу возвражает id записи
     * Производит валидацию спецификации 
     */
    async insert(data: any, trxOpt?: Transaction<any, any>) {
        const dataClone = _.cloneDeep(data)
        await this.specValidation(data.category_id, dataClone.specifications)
        return super.insert(dataClone, trxOpt)
    }

    /**Получаем ПО с дополнительными полями */
    async getUnconfAdditional(id?: number | number[]) {
        const softwares = await this.createSoftwareClasses(id)
        return Promise.all(softwares.map(x => x.get()))
    }

    /**Привязка ПО к оборудованию*/
    async bind(id: number, message: any) {
        const software = (await this.createSoftwareClasses(id))[0]
        await software.bind(message)
        return software.get()
    }

    /**Отвязка ПО от оборудования */
    async unbind(id: number, message: any) {
        const software = (await this.createSoftwareClasses(id))[0]
        await software.unbind(message)
        return software.get()
    }
}