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
const Status = require("../orm/status")
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
        const alreadyConfKeys = Object.keys(eventRec.confirm)
        let confirms = []
        for (let key in confirmPresetValueOnly.confirms) {
            const value = confirmPresetValueOnly.confirms[key]
            confirms[Number(key)] = {
                group: value.group?.value?.[0],
                users: this.uniqObjToBoolObj(value.value),
                type: value.type
            }
        }

        let alreadyConfirms = []
        for (let key in eventRec.confirm.confirms) {
            const value = eventRec.confirm.confirms[key]
            const valuePresetConfirms = confirms[Number(key)]
            alreadyConfirms.push({
                group: valuePresetConfirms.group?.value?.[0],
                users: this.uniqObjToBoolObj(value.value),
                type: value.type,
                action: value.action,
                date: value.date
            })
        }

        const needConfirms = _.remove(confirms, (val, key) => !alreadyConfKeys.includes(String(key)))
        const acceptConfirms = _.filter(alreadyConfirms, { action: "accept" })
        const rejectConfirms = _.filter(alreadyConfirms, { action: "reject" })

        this.records = {
            event: eventRec,
            history: hisRec,
            status: statusRec,
            preset: eventPresetRec,
            other: {
                table_id: getTabIdFromHis(hisRec),
                personal_ids: confirmPresetValueOnly.personal,
                confirm_need: needConfirms,
                confirm_accept: acceptConfirms,
                confirm_reject: rejectConfirms
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
     * {"a":2,"b":3, "1":5} => {2: true, 3: true, 5:true}
     * @param {*} obj 
     */
    uniqObjToBoolObj(obj) {
        /**@type {*} */
        const boolObj = {}
        for (let key in obj) {
            if (obj[key]) {
                boolObj[obj[key]] = true
            }
        }
        return boolObj
    }

    get() {
        return {
            history_id: this.records.history.id,
            event_confirm_preset_id: this.records.preset.id,
            confirm_need: this.records.other.confirm_need,
            confirm: this.records.other.confirm_accept,
            confirm_reject: this.records.other.confirm_reject,
            status: this.records.event.status,
            table: this.records.preset.table,
            table_id: this.records.other.table_id,
            name: this.records.preset.name,
            name_rus: this.records.preset.name_rus,
            actor_id: this.records.history.actor_id,
            personal_ids: this.uniqObjToBoolObj(this.records.other.personal_ids),
            //additional: { device_user_id: eventHistory.diff.user_id },
            date: this.records.event.date,
            date_completed: this.records.event.date_completed
        }
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
     * @param {number} actorId
     */
    static async getEvents(actorId) {
        const eventRecArray = await Event_confirm.query()
        const hisIds = _.map(eventRecArray, "history_id")
        const presetIds = _.map(eventRecArray, "event_confirm_preset_id")
        const hisRecIndexed = _.keyBy(await History.query().findByIds(hisIds), "id")
        const presetRecIndexed = _.keyBy(await Event_confirm_preset.query().findByIds(presetIds), "id")
        const confirmCompletion = PresetParse.confirmCompletionMemoize()
        /**@type {*} */
        const statusIndexed = _.keyBy(await Status.query(), "id")
        const eventsArray = []
        for (let eventRec of eventRecArray) {
            const hisRec = hisRecIndexed[eventRec.history_id]
            /**@type {*} */
            const presetRec = presetRecIndexed[eventRec.event_confirm_preset_id]
            const statusRec = statusIndexed(presetRec.status_id)
            const confirmPresetValueOnly = await confirmCompletion(presetRec, hisRec)
            const eventsInst = new this(eventRec, hisRec, presetRec, statusRec, confirmPresetValueOnly, actorId)
            eventsArray.push(eventsInst)
        }

        return eventsArray
    }
}