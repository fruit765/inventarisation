'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Post_dep_loc extends Model {
    static get tableName() {
        return "post_dep_loc"
    }

    static get relationMappings() {
        const Department = require("./department")
        const Location = require("./location")
        const Post = require("./post")

        return {
            department: {
                relation: Model.BelongsToOneRelation,
                modelClass: Department,
                join: {
                    from: "post_dep_loc.department_id",
                    to: "department.id"
                }
            },

            post: {
                relation: Model.BelongsToOneRelation,
                modelClass: Post,
                join: {
                    from: "post_dep_loc.post_id",
                    to: "post.id"
                }
            },

            location: {
                relation: Model.BelongsToOneRelation,
                modelClass: Location,
                join: {
                    from: "post_dep_loc.location_id",
                    to: "location.id"
                }
            },

            user: {
                relation: Model.HasManyRelation,
                modelClass: User,
                join: {
                    from: "post_dep_loc.id",
                    to: "user.post_dep_loc_id"
                }
            },
        }
    }
}