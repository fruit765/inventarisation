"use strict"

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)
const _ = require("lodash")
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

        options.isSaveHistory = _.isNil(options.isSaveHistory) ? true : Boolean(options.isSaveHistory)

        this.setOpt(options)
    }

    setOpt(options) {
        this.setActorId(options.actorId)
        this.setSaveHistory(options.isSaveHistory)
        return this
    }

    setActorId(actorId) {
        if (actorId) {
            this._options.actor_id = actorId
        }
        return this
    }

    setSaveHistory(isSaveHistory) {
        if (isSaveHistory != undefined) {
            if (isSaveHistory) {
                this._HColName = this._tableName + "_id"
                this._isSaveHistory = knex.schema.hasColumn(History.tableName, this._HColName)
            } else {
                this._isSaveHistory = Promise.resolve(false)
            }
        }
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

    _delUndefined(obj) {
        const result = {}
        for (let key in obj) {
            if (obj[key] !== undefined) {
                result[key] = obj[key]
            }
        }

        return result
    }

    async _saveHistory(data, actionTag, trx) {
        const isSaveHistory = await this._isSaveHistory
        const dataWithoutId = this._delUndefined(_.omit(data, "id"))

        if (
            !isSaveHistory ||
            (!Object.keys(dataWithoutId).length && actionTag !== "delete") ||
            this._options.actor_id == undefined) {
            return null
        }

        const historyInsertData = {}
        historyInsertData[this._HColName] = data.id
        historyInsertData["actor_id"] = this._options.actor_id
        historyInsertData["diff"] = JSON.stringify(dataWithoutId)
        historyInsertData["action_tag"] = actionTag
        await History.query(trx).insert(historyInsertData)
    }

    async _getActualData(id) {
        let actualData = await this._tableClass.query().findById(id)
        if (!actualData) {
            throw this.createError400Pattern("id", "This id was not found")
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
        return this._tableClass.transaction(async trx => {
            const insertRow = await this._tableClass.query(trx).insertAndFetch(readyToInsert)
            await this._saveHistory(insertRow, "insert", trx)
            return insertRow
        })
    }

    async patchAndFetch(data) {
        const actualData = await this._getActualData(data.id)
        const onlyModData = await this._onlyModifyWithId(data, actualData)
        const onlyModWithCompleteJson = await this._additionColJSON(onlyModData, actualData)
        const readyToPatch = this._stringifyColJSON(onlyModWithCompleteJson)
        await this._tableClass.transaction(async trx => {
            await this._tableClass.query(trx)
                .findById(data.id)
                .patch(_.omit(readyToPatch, "id"))
            await this._saveHistory(onlyModData, "patch", trx)
        })
        return Object.assign(actualData, onlyModWithCompleteJson)
    }

    createError400Pattern(dataPath, message) {
        const err = createError(400)
        err.message = [{
            "dataPath": "." + dataPath,
            "message": message
        }]
        return err
    }

    async delete(findData) {
        return this._tableClass.transaction(async trx => {
            const deletedData = await this.query(trx).where(findData)
            if (deletedData[0]) {
                const ids = _.map(deletedData, 'id')
                await this.query(trx).whereIn("id",ids).delete()
                await Promise.all(ids.map((id) => {
                    return this._saveHistory({ id }, "delete", trx)
                }))
                return deletedData
            } else {
                throw this.createError400Pattern("object", "No records found based on your data")
            }
        })
    }

    async deleteById(id) {
        return this._tableClass.transaction(async trx => {
            const res = await this.query(trx).deleteById(id)
            if (res) {
                this._saveHistory({ id }, "delete", trx)
                return id
            } else {
                throw this.createError400Pattern("id", "This id was not found")
            }
        })
    }

    get() {
        return this._tableClass.query()
    }

    query() {
        return this._tableClass.query()
    }
}  