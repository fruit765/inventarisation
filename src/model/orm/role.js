'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Role extends Model {
    static get tableName() {
        return "role"
    }

    static get relationMappings() {
        const Credentials = require("./credentials")

        return {
            credentials: {
                relation: Model.HasManyRelation,
                modelClass: Credentials,
                join: {
                    from: "role.id",
                    to: "credentials.role_id"
                }
            }
        }
    }
}