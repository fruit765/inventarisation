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
        const User = require("./user")
        const Dep_loc = require("./dep_loc")
        const Post = require("./post")

        return {
            post: {
                relation: Model.BelongsToOneRelation,
                modelClass: Post,
                join: {
                    from: "post_dep_loc.post_id",
                    to: "post.id"
                }
            },

            dep_loc: {
                relation: Model.BelongsToOneRelation,
                modelClass: Dep_loc,
                join: {
                    from: "post_dep_loc.dep_loc_id",
                    to: "dep_loc.id"
                }
            },

            user: {
                relation: Model.HasManyRelation,
                modelClass: User,
                join: {
                    from: "post_dep_loc.id",
                    to: "user.post_dep_loc_id"
                }
            }
        }
    }
}