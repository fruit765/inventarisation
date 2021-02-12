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
        /**
         * @type {{priority: number}}
         * @private
         */
        this.options = { priority: 0 }
    }

    /**
     * Возвращает коллекцию соответствующую ТОЛЬКО неподтвержденным данным из текущей таблицы
     * возможен фильтр по id
     * @param {string} tableName 
     * @param {number} priority евенты с большим или равным приоритетом будут возвращатся с измененными параметрами
     * с меньши, будут содержать только статус
     * @param {number|undefined} id 
     * @returns {Promise<{id: number, [key: string]: any}[]>}
     * @private
     */
    static async getUnconfirmDataUni(tableName, id, priority = 0) {
        const unconfirmed = await Event_confirm
            .query()
            .skipUndefined()
            .where(tableName + "_id", id)
            .where("table", tableName)
            .select(tableName + "_id", "status.status", "status.status_id", "diff")
            .whereNull("date_completed")
            .joinRelated(`[history.${tableName},event_confirm_preset.status]`)

        /**
         * 
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
                return _.set(accumulator, tabId, [elem, currentValue.view_priority])
            } else {
                return accumulator
            }
        }, {})

        return _.values(unconfirmedFiltered).map(x => x[0])
    }

    /**
     * Возвращает объект соответствующую ТОЛЬКО неподтвержденным данным из текущей таблицы по id
     * @param {string} tableName 
     * @param {number} priority евенты с большим или равным приоритетом будут возвращатся с измененными параметрами
     * с меньши, будут содержать только статус
     * @param {number} id
     * @returns {Promise<{id: number, [key: string]: any}>}
     */
    static async getUnconfirmDataById(tableName, id, priority = 0) {
        const res = await this.getUnconfirmDataUni(tableName, id, priority)
        return res[0]
    }

    /**
     * Возвращает коллекцию соответствующую ТОЛЬКО неподтвержденным данным из текущей таблицы
     * @param {string} tableName 
     * @param {number} priority евенты с большим или равным приоритетом будут возвращатся с измененными параметрами
     * с меньши, будут содержать только статус
     * @returns {Promise<{id: number, [key: string]: any}[]>}
     */
    static async getUnconfirmData(tableName, priority = 0) {
        return this.getUnconfirmDataUni(tableName, undefined, priority)
    }



    static async rejectAllByStatus(tableName, status, user_id) {
        const events = await Event_confirm.query()
            .select("event_confirm_preset.confirm as all_need_confirm", "event_confirm.confirm")
            .joinRelated("event_confirm_preset.status")
            .where({ table: tableName, status: status })
            .whereNull("date_completed")
        for (let elem of events) {
            const needConfirm = this.needConfCompare(elem.all_need_confirm, elem.confirm)
        }

    }


    /**
     * Возвращает массив данных с неподтвержденными статусами
     * @returns {Promise<Array<Object>>}
     */
    async getTabUnconfStat() {
        const tableData = await this.tableClass.query()
        /**@type {Object<number,Object>} */
        let tableDataIdKey = _.keyBy(tableData, "id")
        /**@type {Array<Object>} */
        const tableDataUnconf = await this.events.getUnconfirmData()
        for (let elem of tableDataUnconf) {
            Object.assign(tableDataIdKey[elem.id], elem)
        }
        /**@type {Array<Object>} */
        const tableWithUnfonfData = _.values(tableDataIdKey)
        return tableWithUnfonfData
    }

    static getEvents() {

    }

    /**
     * Возвращает коллекцию соответствующую неподтвержденным данным из текущей таблицы
     */
    getUnconfirmData() {
        return Events.getUnconfirmData(this.tableName, this.options.priority)
    }

    /**
     * Возвращает объект соответствующую неподтвержденным данным из текущей таблицы по id
     * @param {number} id 
     */
    getUnconfirmDataById(id) {
        return Events.getUnconfirmDataById(this.tableName, id, this.options.priority)
    }

    rejectAllByStatus(status) {
        return Events.rejectAllByStatus(this.tableName, status)
    }
}