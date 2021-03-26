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
        const User = require("./user")

        return {
            user: {
                relation: Model.HasManyRelation,
                modelClass: User,
                join: {
                    from: "role.id",
                    to: "user.role_id"
                }
            }
        }
    }
}