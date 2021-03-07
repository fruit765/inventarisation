//@ts-check
/**
 *  @typedef { import("objection") } Objection
 */
"use strict"

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const History = require("../orm/history")
const ApplyAction = require("./applyAction")
const Preset = require("../class/preset/preset")
const { pack } = require("./packDiff")
const knex = Knex(dbConfig)
const _ = require("lodash")
const dayjs = require("dayjs")
const { getTabIdFromHis } = require("./bindHisTabInfo")

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
        const modData = pack(dataCopy, actualData)
        /**@type {*} */
        const historyInsertData = {
            actor_id: this.options.actorId,
            diff: JSON.stringify(modData),
            action_tag: actionTag,
            [this.colName]: data.id
        }
        /**@type {*} */
        const hisRec = await History.query(trx).insert(historyInsertData)
        hisRec.diff = modData
        return hisRec
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
        return startTransOpt(trxOpt, async (trx) => {
            const hisRec = await this.saveHistoryOnly(data, actionTag, trx)
            const objId = getTabIdFromHis(hisRec)
            const actualPresets = await Preset.getActualPresets()
            const actualData = await this.tableClass.query(trx).findById(objId)
            for (let actualPreset of actualPresets) {
                await actualPreset.genEventsByHisRec(hisRec, actualData)
            }
            await this.applyActionClass.commitHistory(hisRec.id, trx)
            return hisRec
        })
    }
}