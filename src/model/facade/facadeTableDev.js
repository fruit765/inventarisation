//@ts-check
"use strict"
const FacadeTable = require("./facadeTable")
const Status = require("../orm/status")
const Responsibility = require("../orm/responsibility")
const { createException } = require("../libs/command")
const Category = require("../orm/category")
const CyrillicToTranslit = require("cyrillic-to-translit-js")
const cyrillicToTranslit = new CyrillicToTranslit()
const Ajv = require("ajv").default
const ajv = new Ajv()
const _ = require("lodash")

module.exports = class FacadeTableDev extends FacadeTable {

    async specValidation(catId, spec) {
        /**@type {*} */
        const catRow = await Category.query().findById(catId)
        const validate = ajv.compile(catRow.schema)
        const valid = validate(spec)
        if (!valid) console.log(validate.errors)
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
        await this.specValidation(dataClone.specifications)
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