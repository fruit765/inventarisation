"use strict"

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)
const fp = require("lodash/fp")
const createError = require('http-errors')

const History = require("../orm/history")

module.exports = class Table {
    constructor(tableClass, options) {
        if (!options) {
            options = {}
        }
        this._options = {}
        this._tableClass = tableClass
        this._tableName = this._tableClass.tableName

        options.isSaveHistory = fp.isNil(options.isSaveHistory) ? true : Boolean(options.isSaveHistory)

        this.setOpt(options)
    }

    _differenceProps(value1, value2) {
        const fillteredData = {}
        if (typeof value2 !== "object" || typeof value1 !== "object") {
            return value1
        }
        for (let key in value1) {
            if (value1[key] !== undefined && value1[key] != value2[key]) {
                fillteredData[key] = value1[key]
            }
        }
        return fillteredData
    }

    setOpt(options) {
        this.setActorId(options.actorId)
        if (options.isSaveHistory != undefined) {
            if (options.isSaveHistory) {
                this._HColName = this._tableName + "_id"
                this._isSaveHistory = knex.schema.hasColumn(this._tableName, this._HColName)
            } else {
                this._isSaveHistory = Promise.resolve(false)
            }
        }

        return this
    }

    setActorId(actorId) {
        if (actorId) {
            this._options.actor_id = actorId
        }
        return this
    }

    async _saveHistory(data) {
        const isSaveHistory = await this._isSaveHistory

        if (!isSaveHistory) {
            return null
        }

        const historyInsertData = {}
        historyInsertData[this._HColName] = data.id
        historyInsertData["actor_id"] = this._options.actor_id
        //historyInsertData["action_code_id"] = 
        historyInsertData["diff"] = JSON.stringify(fp.omit("id")(data))
        await History.query().insert(historyInsertData)
    }

    async _getActualData(id) {
        let actualData = await this._tableClass.query().findById(data.id)
        if(!actualData) {
            throw createError(400, "This id was not found") 
        }
        return actualData
    }

    async _onlyModifyWithId(data, actualData) {
        const fillteredData = this._differenceProps(data, actualData)

        for (let key in fillteredData) {
            if (typeof actualData[key] === "object") {
                fillteredData[key] = this._differenceProps(fillteredData[key], actualData[key])
            }
        }
        fillteredData.id = data.id
        return fillteredData
    }

    async _additionColJSON(data, actualData) {
        const fillteredData = {}
        for (let key in data) {
            if (typeof data[key] === "object" && actualData[key] === "object") {
                fillteredData[key] = Object.assign(actualData[key], data[key])
            } else {
                fillteredData[key] = data[key]
            }
        }

        return fillteredData
    }

    _stringifyColJSON(data) {
        const fillteredData = {}
        for (let key in data) {
            if (typeof data[key] === "object") {
                fillteredData[key] = JSON.stringify(data[key])
            } else {
                fillteredData[key] = data[key]
            }
        }
        return fillteredData
    }

    async insertAndFetch(data) {
        const readyToInsert = this._stringifyColJSON(data)
        const insertRow = await this._tableClass.query().insertAndFetch(readyToInsert)
        await this._saveHistory(insertRow)
        return insertRow
    }

    async patchAndFetch(data) {
        const actualData = await this._getActualData(data.id)
        const onlyModData = await this._onlyModifyWithId(data, actualData)
        const onlyModWithCompleteJson = await this._additionColJSON(onlyModData, actualData)
        const readyToPatch = this._stringifyColJSON(onlyModWithCompleteJson)
        await this._tableClass.query()
            .findById(data.id)
            .patch(fp.omit("id")(readyToPatch))
        await this._saveHistory(onlyModData)
        return onlyModWithCompleteJson
    }

    async delete (id) {
        const res = await this.query().deleteById(id)
        if (res) {
            return id
        }
    }

    get() {
        return this._tableClass.query()
    }
}  