'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Account extends Model {
    static get tableName() {
        return "account"
    }

    static get relationMappings() {
        const Service = require("./service")
        const User = require("./user")
        const History = require("./history")

        return {
            service: {
                relation: Model.BelongsToOneRelation,
                modelClass: Service,
                join: {
                    from: "account.service_id",
                    to: "service.id"
                }
            },

            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "account.user_id",
                    to: "user.id"
                }
            },

            history: {
                relation: Model.HasManyRelation,
                modelClass: History,
                join: {
                    from: "account.id",
                    to: "history.account_id"
                }
            }
        }
    }
}