//@ts-check
/**
 * @typedef { import("objection") } Objection
 */


"use strict"

const Event_confirm = require("../orm/event_confirm")
const Event_confirm_preset = require("../orm/event_confirm_preset")
const _ = require("lodash")

/**
 * @class
 * @classdesc Класс отвечает за события
 */
module.exports = class Events {
    /**
     * @param {Objection["Model"]} tableClass 
     * @param {Options} options
     * 
     * @typedef {Object} Options
     * @property {number} priority
     */
    constructor(tableClass, options) {
        /**
         * @readonly
         * @private
         */
        this.tableClass = tableClass
        /**
         * @type {{priority: number}}
         * @private
         */
        this.options = { 
            priority: options.priority ?? 0 
        }

    }

    /**
     * Получение всех неподтвержденных данных
     * @param {?*} id 
     */
    async getUnconfirm(id) {
        id = id ?? undefined

        const unconfirmed = await Event_confirm
            .query()
            .skipUndefined()
            .where("table", this.tableClass.tableName)
            .select(this.tableClass.tableName + "_id", "status.status", "status.status_id", "diff")
            .whereNull("date_completed")
            .joinRelated(`[history.${tableName},event_confirm_preset.status]`)

    }

    /**
     * Снимок неподтвержденных данных, вычисляется в зависимости от приоритета
     * @param {?*} id 
     */
    async getUnconfirmSnapshot(id) {
        id = id ?? undefined

        const unconfirmed = await Event_confirm
            .query()
            .skipUndefined()
            .where(this.tableClass.tableName + "_id", id)
            .where("table", this.tableClass.tableName)
            .select(tableName + "_id", "status.status", "status.status_id", "diff")
            .whereNull("date_completed")
            .joinRelated(`[history.${tableName},event_confirm_preset.status]`)

    }

}