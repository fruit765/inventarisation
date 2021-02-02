"use strict"

const dbConfig = require("../../../serverConfig").db
const Device = require("../orm/device")
const Event_confirm = require("../orm/event_confirm")
const Event_confirm_preset = require("../orm/event_confirm_preset")
const History = require("../orm/history")
const Table = require("./table")
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
                events.push({
                    history_id: eventHistory.id,
                    event_confirm_preset_id: eventPreset.id,
                    table: eventPreset.table,
                    table_id: eventHistory[eventPreset.table+"_id"],
                    name: eventPreset.name,
                    name_rus: eventPreset.name_rus,
                    actor_id: eventHistory.actor_id,
                    need_confirm: [{user: [eventHistory.actor_id]},{user: [eventHistory.diff.user_id]}],//[{user:[1,2,3,4]},{user:[5,6,7,8]}]
                    confirm: eventsConfirm,
                    status: "pending", //dsdsd
                    personal_ids: actor_id //sdsdsdsds
                })
            }
        }

        return events
    }

}