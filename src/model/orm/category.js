"use strict"

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const {Model} = require("objection")
const knex=Knex(dbConfig)

Model.knex(knex)

module.exports = class Category extends Model {
    static get tableName() {
        return "category"
    }

    static get relationMappings() {
        const Device = require("./device")

        return {
            device: {
                relation: Model.HasManyRelation,
                modelClass: Device,
                join: {
                    from: "category.id",
                    to: "device.category_id"
                }
            },

            parent: {
                relation: Model.BelongsToOneRelation,
                modelClass: Category,
                join: {
                    from: "category.parent_id",
                    to: "category.id"
                }
            },

            children: {
                relation: Model.HasManyRelation,
                modelClass: Category,
                join: {
                    from: "category.id",
                    to: "category.parent_id"
                }
            }
        }
    }
}