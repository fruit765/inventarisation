'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Post extends Model {
    static get tableName() {
        return "post"
    }

    static get relationMappings() {
        const User = require("./user")
        const Post_dep_loc = require("./post_dep_loc")

        return {
            post_dep_loc: {
                relation: Model.HasManyRelation,
                modelClass: Post_dep_loc,
                join: {
                    from: "post.id",
                    to: "post_dep_loc.post_id"
                }
            }
        }
    }
}