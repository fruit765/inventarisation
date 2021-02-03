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
        for (let eventPreset of eventsPreset) {
            const eventHistories = await this._globalHistory.getByPreset(eventPreset.table, eventPreset.preset)
            for (let eventHistory of eventHistories) {
                events.push({
                    history_id: eventHistory.id,
                    event_confirm_preset_id: eventPreset.id,
                    need_confirm: [{users:[eventHistory.actor_id]},{users:[eventHistory.diff.user_id]}],
                    confirm: [],
                    status: "pending", //dsdsd
                    table: eventPreset.table,
                    table_id: eventHistory[eventPreset.table+"_id"],
                    name: eventPreset.name,
                    name_rus: eventPreset.name_rus,
                    actor_id: eventHistory.actor_id,
                    personal_ids: [eventHistory.actor_id, eventHistory.diff.user_id],
                    additional: {device_user_id: eventHistory.diff.user_id}
                })
            }
        }

        return events
    }

}