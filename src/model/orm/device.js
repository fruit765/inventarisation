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
        const Category = require("./category")
        const Supplier = require("./supplier")
        const Status = require("./status")
        const Location = require("./location")
        const User = require("./user")
        const History = require("./history")
        const Act = require("./act")

        return {
            brand: {
                relation: Model.BelongsToOneRelation,
                modelClass: Brand,
                join: {
                    from: "device.brand_id",
                    to: "brand.id"
                }
            },

            category: {
                relation: Model.BelongsToOneRelation,
                modelClass: Category,
                join: {
                    from: "device.category_id",
                    to: "category.id"
                }
            },

            status: {
                relation: Model.BelongsToOneRelation,
                modelClass: Status,
                join: {
                    from: "device.status_id",
                    to: "status.id"
                }
            },
 
            supplier: {
                relation: Model.BelongsToOneRelation,
                modelClass: Supplier,
                join: {
                    from: "device.supplier_id",
                    to: "supplier.id"
                }
            },

            location: {
                relation: Model.BelongsToOneRelation,
                modelClass: Location,
                join: {
                    from: "device.location_id",
                    to: "location.id"
                }
            },

            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "device.user_id",
                    to: "user.id"
                }
            },

            history: {
                relation: Model.HasManyRelation,
                modelClass: History,
                join: {
                    from: "device.id",
                    to: "history.device_id"
                }
            },

            parent: {
                relation: Model.BelongsToOneRelation,
                modelClass: Device,
                join: {
                    from: "device.parent_id",
                    to: "device.id"
                }
            },

            children: {
                relation: Model.HasManyRelation,
                modelClass: Device,
                join: {
                    from: "device.id",
                    to: "device.parent_id"
                }
            },

            act: {
                relation: Model.HasManyRelation,
                modelClass: Act,
                join: {
                    from: "device.id",
                    to: ref("act.description:device_id").castInt()
                }
            }
        }
    }

    static async getWithVirtualStatus() {
        return this.query().joinRelated("status").select("device.*","status.status")
        // const devices = await this.query().joinRelated("act.act_type")
        // for 
    }

}