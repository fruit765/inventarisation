'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const PasswordExt = require('objection-password')()
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Password extends PasswordExt(Model) {
    static get tableName() {
        return "password"
    }

    static get relationMappings() {
        const User = require("./user")

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "password.id",
                    to: "user.id"
                }
            }
        }
    }
}