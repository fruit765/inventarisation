'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")

const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Act_type extends Model {
    static get tableName() {
        return "act_type"
    }

    static get relationMappings() {
        const Act = require("./act")

        return {
            act: {
                relation: Model.HasManyRelation,
                modelClass: Act,
                join: {
                    from: "act_type.id",
                    to: "act.act_type_id"
                }
            }
        }
    }

}