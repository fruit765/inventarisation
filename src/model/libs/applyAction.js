// @ts-check
/**
 * @typedef { import("objection") } Objection
 */

"use strict"

const dayjs = require("dayjs")
const Transaction = require("./transaction")
const _ = require("lodash")
const Event_confirm = require("../orm/event_confirm")
const History = require("../orm/history")

module.exports = class ApplyAction {
    /**
     * @param {Objection["Model"]} tableClass
     */
    constructor(tableClass) {
        /**@private */
        this.tableClass = tableClass
    }

    /**
     * Применяет JSON.stringify ко всем вложенным объектам
     * @param {*} data 
     * @private
     */
    stringifyColJSON(data) {
        /**@type {*}*/
        const fillteredData = {}
        for (let key in data) {
            if (typeof data[key] === "object") {
                fillteredData[key] = JSON.stringify(data[key])
            } else {
                fillteredData[key] = data[key]
            }
        }
        return fillteredData
    }

    /**
     * Проверяет будут ли ошибки при вставке в БД, ничего не меняет в таблице
     * возвращает id объекта, при вставке генерируется id
     * @param {*} data 
     * @param {string} actionTag 
     */
    async validate(data, actionTag) {
        const trx = await this.tableClass.startTransaction()
        const response = this.applyAction(data, actionTag, trx).then(
            async (res) => {
                await trx.rollback()
                return res
            },
            async err => {
                await trx.rollback()
                return Promise.reject(err)
            })
        return response
    }


    /**
     * Просто применяет действие к таблице, используя указанные данные
     * никакие проверки и модификация данных не производится
     * @param {*} data
     * @param {string} actionTag 
     * @param {*=} trx 
     */
    async applyAction(data, actionTag, trx) {
        /**@type {number} */
        let id = data.id
        /**@type {?number} */
        let resId = id
        const rdyData = this.stringifyColJSON(data)
        switch (actionTag) {
            case "delete":
                const delRes = await this.tableClass.query(trx).deleteById(rdyData.id)
                resId = delRes === 0 ? null : id
                break
            case "insert":
                /**@type {{id: number, [key: string]: any}} */
                const resIns = /** @type {any} */ (await this.tableClass.query(trx).insert(rdyData))
                resId = resIns.id
                break
            case "patch":
                const resPatch = await this.tableClass.query(trx).findById(id).patch(_.omit(rdyData, "id"))
                resId = resPatch === 0 ? null : id
                break
        }

        return resId
    }

    /**
     * Если нет открытых событий связынных с этой записью то коммитит запись в истории
     * @param {number} hisId 
     * @param {*=} trxOpt
     */
    async commitHistory(hisId, trxOpt) {
        return Transaction.startTransOpt(trxOpt, async (trx) => {
            const openEvents = await Event_confirm.query().where("history_id", hisId).whereNotNull("date_completed")
            if (!openEvents.length) {
                const curretDataTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await History.query(trx).where("id", hisId).whereNull("commit_date").patch({ commit_date: curretDataTime })
                const hisRec = await History.query().findById(hisId)
                await this.applyAction({ ...hisRec.diff, id: hisRec[this.tableClass.tableName+"_id"] }, hisRec.action_tag, trx)
                return hisRec.id
            }
        })
    }


}