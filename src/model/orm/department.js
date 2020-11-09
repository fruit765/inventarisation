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
        const Department_has_location = require("./department_has_location")

        return {
            Department_has_location: {
                relation: Model.HasManyRelation,
                modelClass: Department_has_location,
                join: {
                    from: "department.id",
                    to: "department_has_location.department_id"
                }
            }
        }
    }
}