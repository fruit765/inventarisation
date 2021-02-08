// @ts-check

"use strict"

const Event_confirm = require("../orm/event_confirm")
const Event_confirm_preset = require("../orm/event_confirm_preset")
const _ = require("lodash")

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
     * @param {number} priority евенты с большим или равным приоритетом будут возвращатся с измененными параметрами
     * с меньши, будут содержать только статус
     * @returns {Promise<{id: number, [key: string]: any}[]>}
     */
    static async getUnconfirmData(tableName, priority = 0) {
        return this.getUnconfirmDataById(tableName, undefined, priority)
    }

    static async getUnconfirmDataById(tableName, id, priority = 0) {
        const unconfirmed = Event_confirm
            .query()
            .skipUndefined()
            .where(tableName + "_id", id)
            .select(tableName + "_id", "status.status", "status.status_id", "diff")
            .whereNull("date_completed")
            .joinRelated(`[history.${tableName},event_confirm_preset.status]`)
            .clone()

        /**
         * @param {number} tabId 
         * @param {*} currentValue 
         * @param {number} priority1 
         */
        const genElem = (tabId, currentValue, priority1) => {
            let elem = {
                id: tabId,
                status: currentValue.status,
                status_id: currentValue.status_id
            }

            if (currentValue.view_priority >= priority1) {
                elem = Object.assign(currentValue.diff, elem)
            } 

            return elem
        }

        const unconfirmedFiltered = unconfirmed.reduce((accumulator, currentValue) => {
            const tabId = currentValue[tableName + "_id"]
            if (!accumulator[tabId] || accumulator[tabId][1] < currentValue.view_priority) {
                const elem = genElem(tabId, currentValue, priority)
                return _.set(accumulator, tabId, [elem,currentValue.view_priority])
            } else {
                return accumulator
            }
        }, {})

        return _.values(unconfirmedFiltered).map(x=>x[0])
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