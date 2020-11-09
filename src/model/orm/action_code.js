'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Action_code extends Model {
    static get tableName() {
        return "action_code"
    }

    static get relationMappings() {
        const History = require("./history")

        return {
            history: {
                relation: Model.HasManyRelation,
                modelClass: History,
                join: {
                    from: "action_code.id",
                    to: "history.action_code_id"
                }
            }
        }
    }
}