"use strict"

const dbConfig = require("../../../serverConfig").db
const Device = require("../orm/device")
const Event_confirm = require("../orm/event_confirm")
const Event_confirm_preset = require("../orm/event_confirm_preset")
const History = require("../orm/history")
const Table = require("./table")
const knex = Knex(dbConfig)
const _ = require("lodash")

module.exports = class GlobalHistory {
    constructor() {

    }

    async _selectSqlStrToValue(sqlValuesRaw) {
        let sqlStringArray = []
        let sqlValues = []

        if (typeof sqlValuesRaw === "string") {
            sqlStringArray = [sqlValuesRaw]
        } else if (typeof sqlValuesRaw === "object") {
            sqlStringArray = sqlValuesRaw
        }

        if (sqlStringArray.length) {
            sqlValues = await Promise.all(sqlStringArray.map(async value => {
                const query = _.get(value.trim().match(/^select.*/), "[0]")
                return await knex.raw(query)
            }))
        }

        return sqlValues
    }

    _prepareLogicChVal(logicChainRaw, keyValues) {
        let logicChain = ""

        if (typeof logicChainRaw === "string") {
            logicChain = logicChainRaw.trim().split(" ").map(x => {
                const regExpKeys = _.keys(keyValues).join("|")
                const regExp = new RegExp(`^(${regExpKeys})`, "gi")
                return x.match(regExp) ? "=" + x : x
            }).join(" ")
        } else {

            _.forOwn(keyValues, (valArray, valType) => {
                _.forEach(valArray, (subValue, subKey) => {
                    if (subValue != null) {
                        logicChain = logicChain + `=${valType + subKey} AND `
                    }
                })
            })

            logicChain = logicChain.slice(0, -5)
        }

        logicChain = `( ${logicChain} )`

        return logicChain
    }

    _buildQueryStrByLogicChVal(logicChain, keyValues, columnName) {
        const worldsArray = logicChain.split(" ")

        let queryCondition = worldsArray.map(x => {
            const regExpKeys = _.keys(keyValues).join("|")
            const regExp = new RegExp(`(${regExpKeys})`, "gi")
            return x.match(regExp) ? `JSON_EXTRACT(diff, '$.${columnName}')` + x : x
        }).join(" ")


        _.forOwn(keyValues, (valArray, valType) => {
            _.forEach(valArray, (subValue, subKey) => {
                const regExp = new RegExp(valType + subKey, "gi")
                queryCondition = queryCondition.replace(regExp, subValue)
            })
        })

        return queryCondition
    }

    async _buildQueryStrByColObj(colObj, columnName) {
        const sqlValues = await this._selectSqlStrToValue(colObj.sql) //получаем 2 мерный массив [[1,3],[3,5],[6]]
        const values = colObj.values
        //подготавливает логическую цепочку, возвращает цепочку по умолчанию если она пустая, изменяет
        //цепочку для одномерных
        const logicChain = this._prepareLogicChVal(colObj.logicChain, {sql: sqlValues, values: values })

        this._buildQueryStrByLogicChVal(logicChain, {sql: sqlValues, values: values } ,columnName)
    }

    async _presetColumnToQueryCondition(columns, columnsKey) {
        let logicChain
        let sqlValues, values = []

        sqlValues = await this._selectSqlStrToValue(columns[columnsKey].sql)

        if (typeof columns[columnsKey].value === "string") {
            values = [columns[columnsKey].value]
        } else if (typeof columns[columnsKey].value === "object") {
            values = columns[columnsKey].value
        }

        logicChain = this._prepareLogicChVal(columns[columnsKey].logicChain, { sql: sqlValues, value: values })
        return this._buildQueryStrByLogicChVal(logicChain, sqlValues, values, columnsKey)

    }

    getByPreset(tableName, preset) {
        let columns = preset.columns
        let columnsOld
        let columnsOldKeys, columnsKeys

        if (columns.new) {
            columns = columns.new
            if (columns.old && Object.keys(columns.old).length) {
                columnsOld = columns.old
                columnsOldKeys = Object.keys(columnsOld)
            }
        }

        columnsKeys = Object.keys(columns)

        _.forOwn(columns, (columnValue, columnName) => {
            this.
        })

        const logicChain = this._prepareLogicChCol(preset.logicChain,)

        this._buildQueryStrByLogicChCol(logicChain,)

        if (columnsKeys.length && knex.schema.hasColumn(History.tableName, tableName + "_id")) {
            let eventsHistory = History.query().whereNotNull(eventPreset.table + "_id")

            // if (typeof preset.logicChain === "string") {

            // }

            for (let columnsKey of columnsKeys) {
                eventsHistory = this._presetColumnToQueryBulder(eventsHistory, columns, columnsKey)
            }
        }
    }


}