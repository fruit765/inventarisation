'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Supplier extends Model {
    static get tableName() {
        return "supplier"
    }

    static get relationMappings() {
        const Device = require("./device")

        return {
            device: {
                relation: Model.HasManyRelation,
                modelClass: Device,
                join: {
                    from: "supplier.id",
                    to: "device.supplier_id"
                }
            }
        }
    }
}