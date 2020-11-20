'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Account_name extends Model {
    static get tableName() {
        return "account_name"
    }

    static get relationMappings() {
        const Account = require("./account")

        return {
            account_name: {
                relation: Model.HasManyRelation,
                modelClass: Account,
                join: {
                    from: "account_name.id",
                    to: "account.account_name_id"
                }
            }
        }
    }
}