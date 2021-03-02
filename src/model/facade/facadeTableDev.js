//@ts-check
"use strict"
const FacadeTable = require("./facadeTable")
const Status = require("../orm/status")
const Responsibility = require("../orm/responsibility")
const { createException } = require("../libs/command")
const Category = require("../orm/category")
const CyrillicToTranslit = require("cyrillic-to-translit-js")
const cyrillicToTranslit = new CyrillicToTranslit()
const Ajv = require("ajv")
const ajv = new Ajv({ errorDataPath: 'property', coerceTypes: true, removeAdditional: "all" })
const _ = require("lodash")
const createError = require('http-errors')
const Device = require("../orm/device")

module.exports = class FacadeTableDev extends FacadeTable {

    /**
     * Проверка спецификации оборудования на схему в категории
     * @param {number} catId 
     * @param {*} spec мутирует этот объект
     */
    async specValidation(catId, spec) {
        /**@type {*} */
        const catRow = await Category.query().findById(catId)
        const schema = Object.assign(catRow.schema, { $async: true })
        const validate = ajv.compile(schema)
        const valid = validate(spec)
        if (typeof valid === "boolean") {
            throw createException(500, "the spec in the category has no property $ async: true", "specifications")
        }
        await valid.then(null, err => {
            if (!(err instanceof Ajv.ValidationError)) throw err
            for (let key in err.errors) {
                err.errors[key].dataPath = ".specifications" + err.errors[key].dataPath
            }
            throw createError(400, err.errors)
        })
        return spec
    }

    /**
    * Исполняет указанное действие с сохранением в историю
    * В случае вставки не производит валидацию поскольку она была проведена для
    * генерации инвентарного номера с полученного id
    * 
    * Возвращает id измененной записи
    * @param {*} data 
    * @param {*} actionTag 
    * @protected
    */
    async applyActionSaveHis(data, actionTag) {
        if (actionTag === "insert") {
            if (await this.isSaveHistory && this.history && this.hisColName) {
                const saveHis = await this.history.saveAndApply(data, actionTag)
                return saveHis[this.hisColName]
            }
        } else {
            super.applyActionSaveHis(data, actionTag)
        }
    }

    /**
     * Добовляет данные в таблицу возвражает id записи
     * Так же проверяет на привязку к ответственному по складу
     * Вставляет статус на складе
     * Генерирует инвентарный номер
     * Производит валидацию спецификации оборудования
     * @param {*} data 
     */
    async insert(data) {
        if (!await this.isUserWarehouseResponsible(data.user_id)) {
            throw createException(400, "Not allowed for this user_id", "user_id")
        }
        const dataClone = _.cloneDeep(data)
        await this.specValidation(data.category_id, dataClone.specifications)
        /**@type {number} */
        const status_id = (await Status.query().where("status", "stock").first()).id
        /**@type {*}*/
        const category = await Category.query().findById(dataClone.category_id)
        const validId = await this.applyActionClass.validate(dataClone, "insert")
        const catName4 = String(category.category).slice(0, 4)
        const catName4Translit = cyrillicToTranslit.transform(catName4, "-")
        dataClone.status_id = dataClone.status_id ?? status_id
        dataClone.inv_number = dataClone.inv_number ?? catName4Translit + validId
        return super.insert(dataClone)
    }


    /**
     * Обновляет данные в таблице возвражает id записи
     * Производит валидацию спецификации оборудования
     * @param {*} data 
     */
    async patch(data) {
        const dataClone = _.cloneDeep(data)
        const categoryId = data.category_id ?? (await Device.query().findById(data.id)).category_id
        await this.specValidation(categoryId, dataClone.specifications)
        return super.patch(dataClone)
    }

    /**
     * Привязывает оборудование к пользователю
     * @param {number} devId 
     * @param {number} userId 
     */
    async bind(devId, userId) {
        const unconfirm = (await this.getUnconfirm(devId))[0]
        const unconfirmStatus = unconfirm.status
        if (unconfirmStatus !== "stock") {
            throw createException(400, "Not allowed for this id", "id")
        }
        const status_id = await Status.query().where("status", "given").first()
        return this.patchAndFetch({ id: devId, user_id: userId, status_id: status_id })
    }

    /**
     * Отвязывает оборудование от пользователя
     * @param {number} devId 
     * @param {number} userId 
     */
    async remove(devId, userId) {
        const unconfirm = (await this.getUnconfirm(devId))[0]
        const unconfirmStatus = unconfirm.status
        if (unconfirmStatus !== "given") {
            throw createException(400, "Not allowed for this id", "id")
        }
        if (!await this.isUserWarehouseResponsible(userId)) {
            throw createException(400, "Not allowed for this user_id", "user_id")
        }
        const status_id = await Status.query().where("status", "stock").first()
        return this.patchAndFetch({ id: devId, user_id: userId, status_id: status_id })
    }

    /**
     * Проверяет является ли юзер ответственным за склад
     * @param {number} userId 
     * @private
     */
    async isUserWarehouseResponsible(userId) {
        /**@type {any} */
        const resp = await Responsibility.query().findById(userId)
        return Boolean(resp.warehouseResponsible)
    }
}