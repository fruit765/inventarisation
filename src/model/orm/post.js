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
        const Department_has_location = require("./department_has_location")

        return {
            department_has_location: {
                relation: Model.BelongsToOneRelation,
                modelClass: Department_has_location,
                join: {
                    from: "post.department_has_location_id",
                    to: "department_has_location.id"
                }
            },

            user: {
                relation: Model.HasManyRelation,
                modelClass: User,
                join: {
                    from: "post.id",
                    to: "user.post_id"
                }
            },
        }
    }
}