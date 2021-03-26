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
        const Post_dep_loc = require("./post_dep_loc")
        const Password = require("./password")
        const Device = require("./device")
        const Account_owner = require("./account_owner")
        const Location = require("./location")
        const Role = require("./role")

        return {
            password: {
                relation: Model.HasOneRelation,
                modelClass: Password,
                join: {
                    from: "user.id",
                    to: "password.id"
                }
            },

            role: {
                relation: Model.BelongsToOneRelation,
                modelClass: Role,
                join: {
                    from: "user.role_id",
                    to: "role.id"
                }
            },

            account_owner: {
                relation: Model.HasManyRelation,
                modelClass: Account_owner,
                join: {
                    from: "user.id",
                    to: "account_owner.user_id"
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

            post_dep_loc: {
                relation: Model.BelongsToOneRelation,
                modelClass: Post_dep_loc,
                join: {
                    from: "user.post_dep_loc_id",
                    to: "post_dep_loc.id"
                }
            }
        }
    }
}