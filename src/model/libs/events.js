//@ts-check
/**
 * @typedef { import("objection") } Objection
 */


"use strict"

const Event_confirm = require("../orm/event_confirm")
const Event_confirm_preset = require("../orm/event_confirm_preset")
const History = require("../orm/history")
const _ = require("lodash")

/**
 * @class
 * @classdesc Класс отвечает за события
 */
module.exports = class Events {
    /**
     * @param {Objection["Model"]} tableClass 
     * @param {Options} [options]
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
            .select(this.tableClass.tableName + "_id", "status.status", "status.status_id", "diff", "view_priority", "event_confirm_preset_id")
            .whereNull("date_completed")
            .joinRelated(`[history.${this.tableClass.tableName},event_confirm_preset.status]`)

        const unconfirmedGroup = _.groupBy(unconfirmed, this.tableClass.tableName + "_id")
        const unconfirmedGroupArray = _.values(unconfirmedGroup)
        //Преобразуем двумерный массив в одномерный удаляя в группах значения с наивысшим приоритетом
        const unconfirmedPrior = _.map(unconfirmedGroupArray, (value) => {
            return value.reduce((accumulator, currentValue) => {
                if ((accumulator.view_priority < currentValue.view_priority) ||
                    (
                        accumulator.view_priority === currentValue.view_priority &&
                        accumulator.event_confirm_preset_id < currentValue.event_confirm_preset_id
                    )) {
                    return currentValue
                } else {
                    return accumulator
                }
            }, /**@type {*}*/({}))
        })
        //Преобразуем с коллекции записей в истории
        //в коллекцию записей таблицы
        for (let val in unconfirmedPrior) {
            const statObj = {
                id: this.tableClass.tableName + "_id",
                status: unconfirmedPrior[val].status,
                status_id: unconfirmedPrior[val].status_id,
            }
            unconfirmedPrior[val] = Object.assign(statObj,unconfirmedPrior[val].diff)
        }

        return unconfirmedPrior
    }

    /**
     * Проверяет на наличие событий запись в истории и записывает их в события
     * @param {number} hisId 
     * @param {*} trx 
     */
    async genEventsById(hisId, trx) {
        Event_confirm_preset.query()
        this.presetParse.presetToCond()
        const hisRec = await History.query().findById(hisId)
        
    }

}