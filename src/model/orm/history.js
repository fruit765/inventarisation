'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class History extends Model {
    static get tableName() {
        return "history"
    }

    static get relationMappings() {
        const Action_code = require("./action_code")
        const User = require("./user")
        const Account = require("./account")
        const Device = require("./device")
        const Event_confirm = require("./event_confirm")

        return {
            action_code: {
                relation: Model.BelongsToOneRelation,
                modelClass: Action_code,
                join: {
                    from: "history.action_code_id",
                    to: "action_code.id"
                }
            },

            actor: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "history.actor_id",
                    to: "user.id"
                }
            },

            account: {
                relation: Model.BelongsToOneRelation,
                modelClass: Account,
                join: {
                    from: "history.account_id",
                    to: "account.id"
                }
            },

            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "history.user_id",
                    to: "user.id"
                }
            },
            
            device: {
                relation: Model.BelongsToOneRelation,
                modelClass: Device,
                join: {
                    from: "history.device_id",
                    to: "device.id"
                }
            },

            event_confirm: {
                relation: Model.HasManyRelation,
                modelClass: Event_confirm,
                join: {
                    from: "history.id",
                    to: "Event_confirm.history_id"
                }
            }
        }
    }
}