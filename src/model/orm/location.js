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
        const Dep_loc = require("./dep_loc")

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

            dep_loc: {
                relation: Model.HasManyRelation,
                modelClass: Dep_loc,
                join: {
                    from: "location.id",
                    to: "dep_loc.location_id"
                }
            }
        }
    }
}