//@ts-check
/**
 *  @typedef { import("objection") } Objection
 */
"use strict"

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const History = require("../orm/history")
const Transaction = require("./transaction")
const ApplyAction = require("./applyAction")
const { addedDiff, updatedDiff } = require("deep-object-diff")
const Events = require("../libs/events")
const knex = Knex(dbConfig)
const _ = require("lodash")

module.exports = class GlobalHistory {
    /**
     * @typedef {Object} Options
     * @property {number} actorId
     * @param {Objection["Model"]} tableClass 
     * @param {Options} options
     */
    constructor(tableClass, options) {
        this.tableClass = tableClass
        /**@private */
        this.applyActionClass = new ApplyAction(tableClass)
        /**@private */
        this.colName = tableClass.tableName + "_id"
        /**
         * @private 
         * @type {{actorId: number}}
        */
        this.options = { actorId: options.actorId }
        /**@private */
        this.events = new Events(tableClass)
    }

    /**
     * Проверяет сохраняется ли история у данной таблицы
     * @param {string} tableName
     */
    static async hasHistory(tableName) {
        return knex.schema.hasColumn(History.tableName, tableName)
    }

    /**
     * Возвращает измененные и добавленные данные
     * @param {*} originalObj 
     * @param {*} updatedObj 
     * @private
     */
    diff(originalObj, updatedObj) {
        return Object.assign(addedDiff(originalObj, updatedObj), updatedDiff(originalObj, updatedObj))
    }

    /**
     * Сохраняет запись в историю
     * @param {{id:number, [key: string]: any}} data обязательно должен содержать id
     * @param {string} actionTag 
     * @param {*} trx 
     * @returns {Promise<any>} Возвращает добавленное поле истории
     * @private
     */
    async saveHistoryOnly(data, actionTag, trx) {
        let dataCopy = actionTag === "delete" ? { id: data.id } : { ...data }
        const actualData = await this.tableClass.query().findById(data.id) ?? {}
        const modData = this.diff(actualData, dataCopy)
        const historyInsertData = {
            actor_id: this.options.actorId,
            diff: JSON.stringify(modData),
            action_tag: actionTag,
            [this.colName]: data.id
        }
        return History.query(trx).insert(historyInsertData)
    }

    /**
     * Сохраянет историю, генерирует события,
     * если в строке не найдется открытых событий, запись сразу будет закоммичена
     * @param {*} data 
     * @param {string} actionTag 
     * @param {*=} trxOpt
     * @returns {Promise<*>}
     */
    async saveAndApply(data, actionTag, trxOpt) {
        return Transaction.startTransOpt(trxOpt, async (trx) => {
            const id = await this.applyActionClass.validate(data, actionTag)
            const dataWithValidId = Object.assign({ id }, data)
            const hisRec = await this.saveHistoryOnly(dataWithValidId, actionTag, trx)
            await this.events.genEventsById(hisRec.id, trx)
            await this.applyActionClass.commitHistory(hisRec.id, trx)
            return hisRec
        })
    }
}