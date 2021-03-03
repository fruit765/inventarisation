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
const dayjs = require("dayjs")

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
    }

    /**
     * Проверяет сохраняется ли история у данной таблицы
     * @param {string} tableName
     */
    static async hasHistory(tableName) {
        return knex.schema.hasColumn(History.tableName, tableName)
    }

    /**
     * Возвращает различия между старой записью и новой
     * @param {*} originalObj 
     * @param {*} updatedObj 
     * @private
     */
    diff(originalObj, updatedObj) {
        /**@type {*} */
        const diffObj = {}
        for (let key of _.concat(_.keys(originalObj), _.keys(updatedObj))) {
            if (this.isPrimitiveDiff(originalObj[key], updatedObj[key])) {
                diffObj[key] = updatedObj[key]
            } else if (typeof updatedObj[key] === "object") {
                diffObj[key] = this.diffObj(originalObj[key], updatedObj[key])
            }
        }
        return diffObj
    }

    /**
     * Возвращает различия между объектами,
     * удаленные поля имеют значения в diff "undefined"
     * @param {*} originalObj 
     * @param {*} updatedObj 
     * @private
     */
    diffObj(originalObj, updatedObj) {
        /**@type {*} */
        let diffObj
        if (_.isArray(updatedObj)) {
            diffObj = []
        } else {
            diffObj = {}
        }
        for (let key of _.concat(_.keys(originalObj), _.keys(updatedObj))) {
            if (typeof updatedObj[key] === "object") {
                diffObj[key] = this.diffObj(originalObj?.[key] ?? {}, updatedObj[key])
            } else if (originalObj[key] !== undefined && updatedObj[key] === undefined) {
                diffObj[key] = "undefined"
            } else if (this.isPrimitiveDiff(originalObj[key], updatedObj[key])) {
                diffObj[key] = updatedObj[key]
            }
        }
        return diffObj
    }

    /**
     * Возвращает true если примитивы разные
     * @typedef {(Date | string | boolean | number | null )} compareType
     * @param {compareType} orig 
     * @param {compareType} upd 
     */
    isPrimitiveDiff(orig, upd) {
        if(typeof orig === "boolean") {
            orig = Number(orig)
        }

        if(typeof upd === "boolean") {
            upd = Number(upd)
        }

        if (orig !== upd ||
            (
                (orig instanceof Date || upd instanceof Date) && (
                    orig === null || upd === null || 
                    dayjs(orig).toISOString() !== dayjs(upd).toISOString()
                )
            )) {
            return true
        }
        return false
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
        /**@type {*} */
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
            const hisRec = await this.saveHistoryOnly(data, actionTag, trx)
            await Events.genEventsById(hisRec.id, trx)
            await this.applyActionClass.commitHistory(hisRec.id, trx)
            return hisRec
        })
    }
}