'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class User extends Model {
    static get tableName() {
        return "user"
    }

    static get relationMappings() {
        const Employer = require("./employer")
        const Post = require("./post")
        const Credentials = require("./credentials")
        const Device = require("./device")
        const History = require("./history")
        const Account = require("./account")
        const Location = require("./location")

        return {
            credentials: {
                relation: Model.HasOneRelation,
                modelClass: Credentials,
                join: {
                    from: "user.id",
                    to: "credentials.id"
                }
            },

            history: {
                relation: Model.HasManyRelation,
                modelClass: History,
                join: {
                    from: "user.id",
                    to: "history.user_id"
                }
            },

            account: {
                relation: Model.HasManyRelation,
                modelClass: Account,
                join: {
                    from: "user.id",
                    to: "account.user_id"
                }
            },

            device: {
                relation: Model.HasManyRelation,
                modelClass: Device,
                join: {
                    from: "user.id",
                    to: "device.user_id"
                }
            },
            
            location: {
                relation: Model.BelongsToOneRelation,
                modelClass: Location,
                join: {
                    from: "user.location_id",
                    to: "location.id"
                }
            },

            employer: {
                relation: Model.BelongsToOneRelation,
                modelClass: Employer,
                join: {
                    from: "user.employer_id",
                    to: "employer.id"
                }
            },

            post: {
                relation: Model.BelongsToOneRelation,
                modelClass: Post,
                join: {
                    from: "user.post_id",
                    to: "post.id"
                }
            }
        }
    }
}