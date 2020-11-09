'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Location extends Model {
    static get tableName() {
        return "location"
    }

    static get relationMappings() {
        const Device = require("./device")
        const User = require("./user")
        const Department_has_location = require("./department_has_location")

        return {
            device: {
                relation: Model.HasManyRelation,
                modelClass: Device,
                join: {
                    from: "location.id",
                    to: "device.location_id"
                }
            },

            user: {
                relation: Model.HasManyRelation,
                modelClass: User,
                join: {
                    from: "location.id",
                    to: "user.location_id"
                }
            },

            department_has_location: {
                relation: Model.HasManyRelation,
                modelClass: Department_has_location,
                join: {
                    from: "location.id",
                    to: "department_has_location.location_id"
                }
            }
        }
    }
}