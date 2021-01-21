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
        const Event_confirm_preset = require("./event_confirm_preset")

        return {
            device: {
                relation: Model.HasManyRelation,
                modelClass: Device,
                join: {
                    from: "status.id",
                    to: "device.status_id"
                }
            },

            status: {
                relation: Model.HasManyRelation,
                modelClass: Event_confirm_preset,
                join: {
                    from: "status.id",
                    to: "event_confirm_preset.status_id"
                }
            }
        }
    }

    static async getIdByStatus(status) {
        const statusRow = await this.query().where({status}).first()
        return statusRow.id
    }
}