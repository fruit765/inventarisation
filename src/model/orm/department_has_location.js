'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Department_has_location extends Model {
    static get tableName() {
        return "department_has_location"
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
                    from: "department_has_location.department_id",
                    to: "department.id"
                }
            },

            post: {
                relation: Model.HasManyRelation,
                modelClass: Post,
                join: {
                    from: "department_has_location.id",
                    to: "post.department_has_location_id"
                }
            },

            location: {
                relation: Model.BelongsToOneRelation,
                modelClass: Location,
                join: {
                    from: "department_has_location.location_id",
                    to: "location.id"
                }
            }
        }
    }
}