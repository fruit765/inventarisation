'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Brand extends Model {

    static get tableName() {
        return "brand"
    }

    static get relationMappings() {
        const Device = require("./device")

        return {
            device: {
                relation: Model.HasManyRelation,
                modelClass: Device,
                join: {
                    from: "brand.id",
                    to: "device.brand_id"
                }
            }
        }
    }
}