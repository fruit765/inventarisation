//@ts-check
/**
 * @typedef { import("objection") } Objection
 */


"use strict"

const Event_confirm = require("../orm/event_confirm")
const Event_confirm_preset = require("../orm/event_confirm_preset")
const History = require("../orm/history")
const Transaction = require("./transaction")
const PresetParse = require("./presetParse")
const ApplyAction = require("./applyAction")
const _ = require("lodash")
const dayjs = require("dayjs")

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
     * @property {number=} priority
     * @property {number=} actorId
     * 
     */
    constructor(tableClass, options) {
        /**
         * @readonly
         * @private
         */
        this.tableClass = tableClass
        /**@private */
        this.applyActionClass = new ApplyAction(tableClass)
        /**
         * @type {{priority: number, actorId?: number}}
         * @private
         */
        this.options = {
            priority: options?.priority ?? 0,
            actorId: options?.actorId
        }

    }

    /**
     * Снимок неподтвержденных данных, вычисляется в зависимости от приоритета
     * @param {number=} id 
     */
    async getUnconfirmSnapshot(id) {
        const unconfirmed = await Event_confirm
            .query()
            .skipUndefined()
            .where(this.tableClass.tableName + "_id", /**@type {*}*/(id))
            .where("table", this.tableClass.tableName)
            .select(this.tableClass.tableName + "_id", "event_confirm_preset.status_id", "diff", "view_priority", "event_confirm_preset_id")
            .whereNull("date_completed")
            .joinRelated(`[history.${this.tableClass.tableName},event_confirm_preset]`)

        const unconfirmedGroup = _.groupBy(unconfirmed, this.tableClass.tableName + "_id")
        const unconfirmedGroupArray = _.values(unconfirmedGroup)
        //Преобразуем двумерный массив в одномерный удаляя в группах значения с наивысшим приоритетом
        const unconfirmedPrior = _.map(unconfirmedGroupArray, (value) => {
            return value.reduce((/**@type {*}*/accumulator, /**@type {*}*/currentValue) => {
                if ((accumulator.view_priority < currentValue.view_priority) ||
                    (
                        accumulator.view_priority === currentValue.view_priority &&
                        accumulator.event_confirm_preset_id < currentValue.event_confirm_preset_id
                    )) {
                    return currentValue
                } else {
                    return accumulator
                }
            }, {})
        })
        //Преобразуем с коллекции записей в истории
        //в коллекцию записей таблицы
        for (let val in unconfirmedPrior) {
            const statObj = {
                id: this.tableClass.tableName + "_id",
                status_id: unconfirmedPrior[val].status_id,
            }
            unconfirmedPrior[val] = Object.assign(statObj, unconfirmedPrior[val].diff)
        }

        return unconfirmedPrior
    }

    /**
     * Возвращает активные присеты
     * @private
     */
    async getActualPresets() {
        const curretDataTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        return Event_confirm_preset.query()
            .where("start_preset_date", "<", curretDataTime)
            .andWhere(
                /**@this {any}*/
                function () {
                    this.whereNull("end_preset_date").orWhere("end_preset_date", ">", curretDataTime)
                })
    }

    /**
     * Проверяет соответствует ли история с данным id конкретному пресету
     * @param {number} hisId 
     * @param {*} preset 
     * @private
     */
    async isHisMatchPreset(hisId, preset) {
        const hisRec = await History.query().findById(hisId)
        const currentRec = await this.tableClass.query().findById(hisRec[this.tableClass + "_id"])
        return PresetParse.isDataMatchPreset(hisRec.diff, currentRec, preset)
    }

    /**
     * Проверяет на наличие событий запись в истории, если они есть записывает их
     * @param {number} hisId 
     * @param {*=} trxOpt 
     * @returns {Promise<any[]>}
     */
    async genEventsById(hisId, trxOpt) {
        return Transaction.startTransOpt(trxOpt, async (trx) => {
            const res = []
            const actualPresets = await this.getActualPresets()
            for (let elem of actualPresets) {
                if (await this.isHisMatchPreset(hisId, elem.preset)) {
                    /**@type {*} */
                    const eventRec = {
                        event_confirm_preset_id: elem.id,
                        history_id: hisId,
                        status: "pending"
                    }
                    res.push(eventRec)
                    await Event_confirm.query(trx).insert(eventRec)
                }
            }
            return res
        })

    }

    /**
     * Возвращает список всех событий
     */
    static async getEvents() {
        /**@type {*[]} */
        const res = []
        const events = await Event_confirm.query().joinRelated("[events_confirm_preset,history]")
        events.forEach((/**@type {*}*/event) => {
            res.push({
                history_id: event.history_id,
                event_confirm_preset_id: event.event_confirm_preset_id,
                // confirm_need: need_confirm,
                // confirm: confirm_tmp,
                // confirm_reject: confirm_tmp,
                status: event.status,
                table: event.table,
                table_id: event[event.table + "_id"],
                name: event.name,
                name_rus: event.name_rus,
                actor_id: event.actor_id,
                // personal_ids: personal_ids,
                // additional: { device_user_id: eventHistory.diff.user_id },
                date: event.date,
                date_completed: event.date_completed
            })
        })

        return res
    }

    /**
     * Применить к событию действие
     * @param {[number,number]} eventId
     * @param {string} action
     */
    async eventAction(eventId, action) {
        const event = await Event_confirm.query()
            .where({ event_confirm_preset_id: eventId[0], history_id: eventId[1] })
            .whereNull("date_completed")
            .first()

        if (!event) {
            return null
        }

        const confirm = simpleConfirm()
        await Event_confirm
            .query()
            .where({ event_confirm_preset_id: eventId[0], history_id: eventId[1] })
            .patch({ confirm: JSON.stringify(confirm) })
        
    }

    /**
     * Отклонить событие
     * @param {[number,number]} eventId
     */
    async reject(eventId) {
        this.eventAction(eventId, "reject")
        return
    }
}