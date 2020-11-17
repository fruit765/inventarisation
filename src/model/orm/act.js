'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")

const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Act extends Model {
    static get tableName() {
        return "act"
    }

    static get relationMappings() {
        const User = require("./user")
        const Act_type = require("./act_type")
        
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "act.user_id",
                    to: "user.id"
                }
            },

            act_type: {
                relation: Model.BelongsToOneRelation,
                modelClass: Act_type,
                join: {
                    from: "act.act_type_id",
                    to: "act_type.id"
                }
            }
        }
    }
}