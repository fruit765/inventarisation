"use strict"

const dbConfig = require("../../../serverConfig").db
const Device = require("../orm/device")
const Event_confirm = require("../orm/event_confirm")
const Event_confirm_preset = require("../orm/event_confirm_preset")
const History = require("../orm/history")
const Table = require("./table")
const Knex = require("knex")
const knex = Knex(dbConfig)
const _ = require("lodash")
const GlobalHistory = require("./globalHistory")

module.exports = class Events {
    constructor() {
        this._globalHistory = new GlobalHistory()
    }

    async getEvents() {
        const eventsPreset = await Event_confirm_preset.query()
        const events = []
        const eventsConfirm = Event_confirm.query()
        for (let eventPreset of eventsPreset) {
            const eventHistories = await this._globalHistory.getByPreset(eventPreset.table, eventPreset.preset)
            for (let eventHistory of eventHistories) {
                const confirm_tmp = [{ group: "Выдающий оборудовние", users: {} }, { group: "Принимающий оборудование", users: {}}]
                const need_confirm = _.cloneDeep(confirm_tmp)
                need_confirm[0]["users"][eventHistory.actor_id] = true
                need_confirm[1]["users"][eventHistory.diff.user_id] = true
                const personal_ids = {}
                personal_ids[eventHistory.actor_id] = true
                personal_ids[eventHistory.diff.user_id] = true
                events.push({
                    history_id: eventHistory.id,
                    event_confirm_preset_id: eventPreset.id,
                    confirm_need: need_confirm,
                    confirm: confirm_tmp,
                    confirm_reject: confirm_tmp,
                    status: "pending", //dsdsd
                    table: eventPreset.table,
                    table_id: eventHistory[eventPreset.table + "_id"],
                    name: eventPreset.name,
                    name_rus: eventPreset.name_rus,
                    actor_id: eventHistory.actor_id,
                    personal_ids: personal_ids,
                    additional: { device_user_id: eventHistory.diff.user_id }
                })
            }
        }

        return events
    }

}