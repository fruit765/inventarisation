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
        let sqlStringArray
        let sqlValues = []

        if (typeof sqlValuesRaw === "string") {
            sqlStringArray = [sqlValuesRaw]
        } else if (typeof sqlValuesRaw === "object") {
            sqlStringArray = sqlValuesRaw
        }

        if (sqlStringArray[0]) {
            sqlValues = await Promise.all(sqlStringArray.map(async value => {
                const query = _.get(value.trim().match(/^select.*/), "[0]")
                return _.get(await knex.raw(query), "[0]")
            }))
        }

        return sqlValues
    }

    _prepareLogicChain(logicChainRaw, keyValues) {
        let logicChain = ""

        if (typeof logicChainRaw === "string") {
            logicChain = logicChainRaw.trim().split(" ").map(x=>{
                const regExpKeys = _.keys(keyValues).join("|")
                const regExp = new RegExp(`^(${regExpKeys})`,"gi")
                return x.match(regExp) ? "="+x : x
            }).join(" ")
        } else {

            _.forOwn(keyValues, (value, key)=> {
                _.forEach(value, (subValue, subKey)=> {
                    if (subValue != null) {
                        logicChain = logicChain + `=${key+subKey} AND `
                    }
                })
            })

            logicChain = logicChain.slice(0, -5)
        }

        logicChain = `( ${logicChain} )`

        return logicChain
    }

    _buildQueryStrByLogicChain(logicChain, pattern, keyValues) {
        const worldsArray = logicChain.split(" ")

        let queryCondition = worldsArray.map(x=>{
            const regExpKeys = _.keys(keyValues).join("|")
            const regExp = new RegExp(`(${regExpKeys})`,"gi")
            if (x.match(regExp)) {

            } else {
                return 
            }
            return x.match(regExp) ? `JSON_EXTRACT(diff, "$."+${columnName})`+x : x
        }).join(" ")

        for (let key in sqlValues) {
            const regExp = new RegExp(`(sql${key})`,"gi")
            queryCondition = queryCondition.replace(regExp, sqlValues[key])
        }

        for (let key in values) {
            const regExp = new RegExp(`(value${key})`,"gi")
            queryCondition = queryCondition.replace(regExp, value[key])
        }

    }

    _buildQueryStrByLogicChain(logicChain, sqlValues, values, columnName) {
        const worldsArray = logicChain.split(" ")

        let queryCondition = worldsArray.map(x=>{
            return x.match(/(sql|value)/ig) ? `JSON_EXTRACT(diff, "$."+${columnName})`+x : x
        }).join(" ")

        for (let key in sqlValues) {
            const regExp = new RegExp(`(sql${key})`,"gi")
            queryCondition = queryCondition.replace(regExp, sqlValues[key])
        }

        for (let key in values) {
            const regExp = new RegExp(`(value${key})`,"gi")
            queryCondition = queryCondition.replace(regExp, value[key])
        }

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

        logicChain = this._prepareLogicChain(columns[columnsKey].logicChain, {sql: sqlValues, value: values})
        return this._buildQueryStrByLogicChain(logicChain, sqlValues, values, columnsKey)

    }

    getByPreset(tableName, preset) {
        let columns = preset.columns
        let columnsOld
        let columnsOldKeys, columnsKeys

        if (columns.new) {
            if (columns.old) {
                columnsOld = columns.old
                columnsOldKeys = Object.keys(columnsOld)
            }
            columns = columns.new
        }

        columnsKeys = Object.keys(columns)

        

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