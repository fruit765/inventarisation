'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Account_owner extends Model {
    static get tableName() {
        return "account_owner"
    }

    static get relationMappings() {
        const User = require("./user")
        const Dep_loc = require("./dep_loc")
        const Account = require("./account")

        return {
            account: {
                relation: Model.BelongsToOneRelation,
                modelClass: Account,
                join: {
                    from: "account_owner.account_id",
                    to: "account.id"
                }
            },

            dep_loc: {
                relation: Model.BelongsToOneRelation,
                modelClass: Dep_loc,
                join: {
                    from: "account_owner.dep_loc_id",
                    to: "dep_loc.id"
                }
            },

            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "account_owner.user_id",
                    to: "user.id"
                }
            }
        }
    }
}