'use strict'

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const { Model } = require("objection")
const knex = Knex(dbConfig)

Model.knex(knex)

module.exports = class Device extends Model {
    static get tableName() {
        return "device"
    }

    static get relationMappings() {
        const Brand = require("./brand")

        return {
            brand: {
                relation: Model.HasManyRelation,
                modelClass: Brand,
                join: {
                    from: "brand.id",
                    to: "device.brand_id"
                }
            }
        }
    }

}