'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Event_confirm extends Model {
    static get tableName() {
        return "event_confirm"
    }

    static get relationMappings() {
        const Event_confirm_preset = require("./event_confirm_preset")
        const History = require("./history")

        return {
            event_confirm_preset: {
                relation: Model.BelongsToOneRelation,
                modelClass: Event_confirm_preset,
                join: {
                    from: "event_confirm.event_confirm_preset_id",
                    to: "event_confirm_preset.id"
                }
            },

            history: {
                relation: Model.BelongsToOneRelation,
                modelClass: History,
                join: {
                    from: "event_confirm.history_id",
                    to: "history.id"
                }
            }
        }
    }
}