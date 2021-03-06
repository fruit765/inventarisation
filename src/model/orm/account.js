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
        const Account_type = require("./account_type")
        const History = require("./history")
        const Account_owner = require("./account_owner")

        return {
            account_name: {
                relation: Model.BelongsToOneRelation,
                modelClass: Account_type,
                join: {
                    from: "account.account_type_id",
                    to: "account_type.id"
                }
            },

            // history: {
            //     relation: Model.HasManyRelation,
            //     modelClass: History,
            //     join: {
            //         from: "account.id",
            //         to: "history.account_id"
            //     }
            // },

            account_owner: {
                relation: Model.HasManyRelation,
                modelClass: Account_owner,
                join: {
                    from: "account.id",
                    to: "account_owner.account_id"
                }
            }
        }
    }
}