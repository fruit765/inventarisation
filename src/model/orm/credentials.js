'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const Password = require('objection-password')()
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Credentials extends Password(Model) {
    static get tableName() {
        return "credentials"
    }

    static get relationMappings() {
        const User = require("./user")
        const Role = require("./role")

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "credentials.id",
                    to: "user.id"
                }
            },

            role: {
                relation: Model.BelongsToOneRelation,
                modelClass: Role,
                join: {
                    from: "credentials.role_id",
                    to: "role.id"
                }
            }
        }
    }
}