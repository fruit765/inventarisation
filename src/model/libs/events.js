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
const { getTabIdFromHis, getTabNameFromHis } = require("./command")
const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)

/**
 * @class
 * @classdesc Класс отвечает за события
 */
module.exports = class Events {
    /**
     * @param {*} eventRec
     * @param {*} hisRec
     * @param {*} eventPresetRec
     * @param {*} statusRec
     * @param {*} confirmPresetValueOnly
     * @param {number} actorId
     */
    constructor(eventRec, hisRec, eventPresetRec, statusRec, confirmPresetValueOnly, actorId) {

        this.records = {
            event: eventRec,
            history: hisRec,
            status: statusRec,
            preset: eventPresetRec,
            other: {
                table_id: getTabIdFromHis(hisRec)
            }
        }

        this.confirmPresetValueOnly = confirmPresetValueOnly
        this.applyAction = new ApplyAction((eval(`require("./orm/${this.records.preset.table.toLocaleLowerCase()}")`)))
        this.actorId = actorId
    }

    /**
     * Устанавливает общие поля в блок подтверждения
     */
    confirmDefaultCol() {
        return { date: dayjs().format('YYYY-MM-DD HH:mm:ss') }
    }

    /**
     * Выполняет подтверждение события
     * @param {(type: string) => any} fn блок подтверждения
     * @param {*} [trxOpt]
     */
    async confirm(fn, trxOpt) {
        Transaction.startTransOpt(trxOpt, async trx => {
            if (this.records.event.status !== "pending") {
                return false
            }
            const needConfirm = PresetParse.needConfirm(this.confirmPresetValueOnly?.confirms, this.records.event?.confirms)
            const confirmsGroup = await PresetParse.getConfirmsGroup(needConfirm, this.actorId)
            if (confirmsGroup.length) {
                return false
            }

            /**@type {*} */
            const newConfirmsBlocks = {}

            for (let key in this.confirmPresetValueOnly.confirms) {
                if (!this.records.event?.confirms?.[key] && confirmsGroup.includes(key)) {
                    newConfirmsBlocks[key] = await fn(this.confirmPresetValueOnly.confirms[key].type)
                } else {
                    newConfirmsBlocks[key] = this.records.event?.confirms?.[key]
                }
            }

            const newConfirm = Object.assign({}, this.records.event, { confirms: newConfirmsBlocks })

            await Event_confirm.query(trx).where({
                history_id: this.records.history.id,
                event_confirm_preset_id: this.records.preset.id
            }).patch({ confirm: JSON.stringify(newConfirm) })
            this.records.event = newConfirm
            await this.tryComplete(trx)
            await this.applyAction.commitHistory(this.records.history.id, trx)
            return true
        })
    }

    /**
     * Подтверждает события простого типа
     * @param {("reject"|"accept")} actionTag 
     * @param {*} [trx]
     */
    async simpleConfirm(actionTag, trx) {
        this.confirm((type) => {
            if (type === "simple") {
                Object.assign(
                    this.confirmDefaultCol,
                    {
                        type: "simple",
                        action: actionTag,
                        id: this.actorId
                    })
            }
        }, trx)
    }

    /**
     * Прометит событие как завершенное если оно имеет все подтверждения
     * @param {*} [trx]
     */
    async tryComplete(trx) {
        if (this.records.event.status !== "pending") {
            return false
        }
        if (_.find(this.records.event.confirms, { action: "reject" })) {
            await Event_confirm
                .query(trx)
                .where({
                    history_id: this.records.history.id,
                    event_confirm_preset_id: this.records.preset.id
                })
                .patch({
                    status: "reject",
                    date_complete: dayjs().format('YYYY-MM-DD HH:mm:ss')
                })
        } else if (Object.keys(this.records.event.confirms).length ===
            Object.keys(this.confirmPresetValueOnly.confirms).length) {
            await Event_confirm
                .query(trx)
                .where({
                    history_id: this.records.history.id,
                    event_confirm_preset_id: this.records.preset.id
                })
                .patch({
                    status: "complete",
                    date_complete: dayjs().format('YYYY-MM-DD HH:mm:ss')
                })
        }
        return true
    }

    /**
     * Снимок неподтвержденных данных, вычисляется в зависимости от приоритета
     * @param {string} tableName
     * @param {number=} id 
     */
    static async getUnconfirmSnapshot(tableName, id) {
        const unconfirmed = await Event_confirm
            .query()
            .skipUndefined()
            .where(tableName + "_id", /**@type {*}*/(id))
            .where("table", tableName)
            .select(tableName + "_id", "event_confirm_preset.status_id", "diff", "view_priority", "event_confirm_preset_id")
            .whereNull("date_completed")
            .joinRelated(`[history.${tableName},event_confirm_preset]`)

        const unconfirmedGroup = _.groupBy(unconfirmed, tableName + "_id")
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
                id: tableName + "_id",
                status_id: unconfirmedPrior[val].status_id,
            }
            unconfirmedPrior[val] = Object.assign(statObj, unconfirmedPrior[val].diff)
        }

        return unconfirmedPrior
    }

    /**
     * Возвращает активные пресеты
     * @private
     */
    static async getActualPresets() {
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
    static async isHisMatchPreset(hisId, preset) {
        const hisRec = await History.query().findById(hisId)
        const tableId = getTabIdFromHis(hisRec)
        const tableName = getTabNameFromHis(hisRec)
        const currentRec = await knex(tableName).where("id", tableId).first()
        return PresetParse.isDataMatchPreset(hisRec.diff, currentRec, preset)
    }

    /**
     * Проверяет на наличие событий запись в истории, если они есть записывает их
     * @param {number} hisId 
     * @param {*=} trxOpt 
     * @returns {Promise<any[]>}
     */
    static async genEventsById(hisId, trxOpt) {
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
    static async getEvents(actorId) {
        await Event_confirm.query().withGraphFetched("[event_confirm_preset.status, history]")
        new this
    }
}