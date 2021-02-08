// @ts-check
/**
 * @typedef { import("objection") } Objection
 * @typedef { import("../../types/index").tableOptions } tableOptions
 */

"use strict"

const Device = require("../orm/device")
const Table = require("./table")
const _ = require("lodash")
const createError = require('http-errors')
const Status = require("../orm/status")
const History = require("../orm/history")

module.exports = class TableDevice extends Table {

    /**
     * 
     * @param { tableOptions } options
     */
    constructor(options) {
        super(Device, options)
        this.events = TableEvents(Device)
    }

    /**
     * Возвращает массив оборудования с неподтвержденными статусами
     */
    async getTabUnconfStat() {
        History.
    }

    /**
     * Возвращает статус оборудования с данным id
     * @param {*} deviceId
     * @returns {Promise<string>}
     * @private 
     */
    async getUnconfStatusById(deviceId) {
        return this.getTabUnconfStat()
            .first()
            .findById(deviceId)
            .then(res => res.status)
    }

     /**
     * Возвращает оборудование с данным id и с неподтвержденным текущим статусом
     * @param {*} deviceId
     * @returns {Promise<string>}
     * @private 
     */
    async getTabUnconfStatById(deviceId) {
        return this.getTabUnconfStat()
            .first()
            .findById(deviceId)
            .then(res => res.status)
    }

    /**
     * Возвращает оборудование с данным id и с неподтвержденным текущим статусом
     * @param {*} deviceId
     * @returns {Promise<string>}
     * @private 
     */
    async getTabUnconfStatById(deviceId) {
        return this.getWithUnconfirmStatus()
            .first()
            .findById(deviceId)
            .then(res => res.status)
    }

    /**
     * Проверяет точку на соответствие статусам
     * @param {number} id 
     * @param {string[]} acceptStatuses 
     * @private
     */
    async checkAcceptStatusErr(id, acceptStatuses) {
        /**@type {string} */
        const currentStatus = await this.getUnconfStatusById(id)
        if (!acceptStatuses.includes(currentStatus)) {
            throw new createError.NotAcceptable("This action is not acceptable with this object")
        }
        return true
    }

    /**
     * Меняет статус у девайса
     * @typedef {Object} patchStatusData
     * @prop {number} id
     * @prop {number=} user_id
     * @param {patchStatusData} dataRaw 
     * @param {string} status новый статус
     * @private
     */
    async patchStatus(dataRaw, status) {
        /** @type {number}*/
        const givenStatusId = await Status.query().where("status", status).first().then(res => res ? res.id : res)
        const data = Object.assign({}, dataRaw, { status_id: givenStatusId })
        /**@type {number} */
        return this.patch(data)
    }

    /**
     * Привязывает оборудование к пользователю, выставляя статус given
     * @param {patchStatusData} dataRaw 
     */
    async bindToUser(dataRaw) {
        await this.checkAcceptStatusErr(dataRaw.id, ["stock"])
        const id = await this.patchStatus(dataRaw, "given")
        return this.getTabUnconfStatById(id)
    }

    /**
     * Возвращает оборудование со статусом given на склад 
     * @param {patchStatusData} dataRaw 
     */
    async returnToStock(dataRaw) {
        await this.checkAcceptStatusErr(dataRaw.id, ["given"])
        if (_.isNil(dataRaw.user_id)) {
            /**@type {Object} */
            const res = await this.tableClass.query().findById(dataRaw.id)
            dataRaw.user_id = res ? res.user_id : res
        }
        //await this.stockRespErr(dataRaw.user_id)
        const id = await this.patchStatus(dataRaw, "stock")
        return this.getTabUnconfStatById(id)
    }

    /**
     * Откат для неподтвержденных статусов givenIncomplete и return
     * @param {patchStatusData} dataRaw 
     */
    async remove(dataRaw) {
        const unconfirmStatus = await this.getUnconfStatusById(dataRaw.id)
        switch (unconfirmStatus) {
            case "stock":
            case "given":
                throw new createError.NotAcceptable("This action is not acceptable with this object")
            case "givenIncomplete":
                await this.tableEvents.rejectAllByStatus("givenIncomplete")
                break
            case "return":
                await this.tableEvents.rejectAllByStatus("return")
                break
        }

        return this.getTabUnconfStatById(dataRaw.id)
    }
}