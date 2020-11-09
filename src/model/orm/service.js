'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Service extends Model {
    static get tableName() {
        return "service"
    }

    static get relationMappings() {
        const Account = require("./account")

        return {
            service: {
                relation: Model.HasManyRelation,
                modelClass: Account,
                join: {
                    from: "service.id",
                    to: "account.service_id"
                }
            }
        }
    }
}