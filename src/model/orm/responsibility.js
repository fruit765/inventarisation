'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const Password = require('objection-password')()
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Responsibility extends Password(Model) {
    static get tableName() {
        return "responsibility"
    }

    static get relationMappings() {
        const User = require("./user")

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "responsibility.id",
                    to: "user.id"
                }
            }
        }
    }
}