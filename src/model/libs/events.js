// @ts-check

"use strict"

const Event_confirm = require("../orm/event_confirm")
const Event_confirm_preset = require("../orm/event_confirm_preset")

module.exports = class Events {

    /**
     * @param {string} tableName 
     */
    constructor(tableName) {
        /**
         * @type {string} 
         * @readonly
         * @private
         */
        this.tableName = tableName
    }

    /**
     * Возвращает коллекцию соответствующую неподтвержденным данным из текущей таблицы
     * @param {string} tableName 
     * @param {number} priority 
     * @returns {Promise<{id: number, [key: string]: any}[]>}
     */
    static async getUnconfirmData(tableName, priority) {
        Event_confirm
            .query()
            .whereNull("date_completed")
            .joinRelated(`[history.${tableName},event_confirm_preset]`)
            


        return
    }

    static getUnconfirmDataById(tableName, id, priority) {

    }

    static rejectAllByStatus(tableName, status) {

    }

    static getEvents() {

    }

    getUnconfirmData() {
        return Events.getUnconfirmData(this.tableName, 0)
    }

    getUnconfirmDataById(id) {
        return Events.getUnconfirmDataById(this.tableName, id, 0)
    }

    rejectAllByStatus(status) {
        return Events.rejectAllByStatus(this.tableName, status)
    }
}