'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Department extends Model {
    static get tableName() {
        return "department"
    }

    static get relationMappings() {
        const Post_dep_loc = require("./post_dep_loc")

        return {
            post_dep_loc: {
                relation: Model.HasManyRelation,
                modelClass: Post_dep_loc,
                join: {
                    from: "department.id",
                    to: "post_dep_loc.department_id"
                }
            }
        }
    }
}