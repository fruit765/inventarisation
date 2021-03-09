const { Model } = require("objection")
const SuperModel  = require("./superModel").default

module.exports = class Brand extends SuperModel {

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