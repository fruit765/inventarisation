//@ts-check
"use strict"
const FacadeTable = require("./facadeTable");
const createError = require('http-errors');
const Status = require("../orm/status");
const Responsibility = require("../orm/responsibility");

module.exports = class FacadeTableDev extends FacadeTable {
    /**
     * Привязывает оборудование к пользователю
     * @param {number} devId 
     * @param {number} userId 
     */
    async bind(devId, userId) {
        const unconfirm =  (await this.getUnconfirm(devId))[0]
        const unconfirmStatus = unconfirm.status
        if (unconfirmStatus !== "stock") {
            throw (new createError.BadRequest("Not allowed for this id"))
        }
        const status_id = await Status.query().where("status", "given").first()
        return this.patchAndFetch({id: devId, user_id: userId, status_id: status_id})
    }

    /**
     * Отвязывает оборудование от пользователя
     * @param {number} devId 
     * @param {number} userId 
     */
    async remove(devId, userId) {
        const unconfirm =  (await this.getUnconfirm(devId))[0]
        const unconfirmStatus = unconfirm.status
        if (unconfirmStatus !== "given") {
            throw (new createError.BadRequest("Not allowed for this id"))
        }
        if (!await this.isUserWarehouseResponsible(userId)) {
            throw (new createError.BadRequest("Not allowed for this id"))
        }
        const status_id = await Status.query().where("status", "stock").first()
        return this.patchAndFetch({id: devId, user_id: userId, status_id: status_id})
    }

    /**
     * Проверяет является ли юзер ответственным за склад
     * @param {number} userId 
     */
    async isUserWarehouseResponsible(userId) {
        /**@type {any} */
        const resp = await Responsibility.query().findById(userId)
        return Boolean(resp.warehouseResponsible)
    }
}