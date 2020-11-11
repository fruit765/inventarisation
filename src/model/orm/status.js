'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Status extends Model {
    static get tableName() {
        return "status"
    }

    static get relationMappings() {
        const Device = require("./device")

        return {
            device: {
                relation: Model.HasManyRelation,
                modelClass: Device,
                join: {
                    from: "status.id",
                    to: "device.status_id"
                }
            }
        }
    }
}