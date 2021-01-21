'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Event_confirm_preset extends Model {
    static get tableName() {
        return "event_confirm_preset"
    }

    static get relationMappings() {
        const Status = require("./status")
        const Event_confirm = require("./event_confirm")

        return {
            status: {
                relation: Model.BelongsToOneRelation,
                modelClass: Status,
                join: {
                    from: "event_confirm_preset.status_id",
                    to: "status.id"
                }
            },

            event_confirm: {
                relation: Model.HasManyRelation,
                modelClass: Event_confirm,
                join: {
                    from: "event_confirm_preset.id",
                    to: "event_confirm.event_confirm_preset_id"
                }
            }
        }
    }
}