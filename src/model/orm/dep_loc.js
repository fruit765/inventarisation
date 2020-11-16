'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Dep_loc extends Model {
    static get tableName() {
        return "dep_loc"
    }

    static get relationMappings() {
        const Department = require("./department")
        const Location = require("./location")
        const Account_owner = require("./account_owner")
        const Post_dep_loc = require("./post_dep_loc")

        return {
            department: {
                relation: Model.BelongsToOneRelation,
                modelClass: Department,
                join: {
                    from: "dep_loc.department_id",
                    to: "department.id"
                }
            },

            location: {
                relation: Model.BelongsToOneRelation,
                modelClass: Location,
                join: {
                    from: "dep_loc.location_id",
                    to: "location.id"
                }
            },

            post_dep_loc: {
                relation: Model.HasManyRelation,
                modelClass: Post_dep_loc,
                join: {
                    from: "dep_loc.id",
                    to: "post_dep_loc.dep_loc_id"
                }
            },
            
            account_owner: {
                relation: Model.HasManyRelation,
                modelClass: Account_owner,
                join: {
                    from: "dep_loc.id",
                    to: "account_owner.dep_loc_id"
                }
            },
        }
    }
}