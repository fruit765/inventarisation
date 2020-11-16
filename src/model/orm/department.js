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
        const Dep_loc = require("./dep_loc")

        return {
            dep_loc: {
                relation: Model.HasManyRelation,
                modelClass: Dep_loc,
                join: {
                    from: "department.id",
                    to: "dep_loc.department_id"
                }
            }
        }
    }
}