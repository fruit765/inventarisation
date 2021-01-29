"use strict"

const dbConfig = require("../../../serverConfig").db
const Device = require("../orm/device")
const Event_confirm = require("../orm/event_confirm")
const Event_confirm_preset = require("../orm/event_confirm_preset")
const History = require("../orm/history")
const Table = require("./table")
const knex = Knex(dbConfig)
const _ = require("lodash")

module.exports = class Events {
    constructor() {
        Event_confirm
        Event_confirm_preset

    }

    async _getSqlValues(sqlValuesRaw) {
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

    _completeValuesLogicChain(logicChainRaw, sqlValuesLength, valuesLength) {
        let logicChain = ""

        if (typeof logicChainRaw === "string") {
            logicChain = logicChainRaw.trim().replace(/(?=(sql|value))/gi, "=")
            logicChain = logicChainRaw.trim().split(" ").map(x=>{
                return x.match(/^(sql|value)/ig) ? "="+x : x
            }).join(" ")
        } else {
            for (let key = 0; key < sqlValuesLength; key++) {
                if (sqlValues[key] != null) {
                    logicChain = logicChain + `=sql${key} AND `
                }
            }

            for (let key = 0; key < valuesLength; key++) {
                if (values[key] != null) {
                    logicChain = logicChain + `=value${key} AND `
                }
            }

            logicChain = logicChain.slice(0, -5)
        }

        logicChain = `( ${logicChain} )`

        return logicChain
    }


    _logicChainToQueryCondition(logicChain, sqlValues, values, columnName) {
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

        sqlValues = await this._getSqlValues(columns[columnsKey].sql)
        
        if (typeof columns[columnsKey].value === "string") {
            values = [columns[columnsKey].value]
        } else if (typeof columns[columnsKey].value === "object") {
            values = columns[columnsKey].value
        }

        logicChain = this._completeValuesLogicChain(columns[columnsKey].logicChain, sqlValues.length, values.length)
        return this._logicChainToQueryCondition(logicChain, sqlValues, values, columnsKey)

    }

    _getHistoryByPreset(tableName, preset) {
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

    async getOpenEventBy(filterData) {
        const eventsPreset = await Event_confirm_preset.query().where(filterData)
        const events = await Event_confirm.query()
        const indexEvents = new Map

        for (let event of events) {
            indexEvents[[event.history_id, event.event_confirm_preset_id]] = event
        }

        const response = []

        //[{table: device, table_id: 5, event_confirm_preset:{id:2}, history: {id: 1} , event_confirm: {} }]
        //[{history_id: 1, event_confirm_preset_id:5, confirm: null, is_complete: 1, event_confirm_preset:{id:2}, history: {id: 1}}]

        for (let eventPreset of eventsPreset) {
            const eventsHistory = this._getHistoryByPreset(eventPreset.table, eventPreset.preset)
            for (let eventHistory of eventsHistory) {
                //const is_complete =
                response.push({
                    history_id: eventHistory.id,
                    event_confirm_preset_id: eventPreset.id,
                    history: eventHistory,
                    event_confirm_preset: eventPreset,
                    confirm: indexEvents[[eventHistory.id, eventPreset.id]],
                    is_complete: -1
                })
            }

            const keys = Object.keys(eventPreset.preset.colums)
            if (Object.keys(eventPreset.preset.colums).length && knex.schema.hasColumn(History.tableName, eventPreset.table + "_id")) {
                let eventsHistory = History.query().whereNotNull(eventPreset.table + "_id")
                for (let key of keys) {
                    const value = this._extractValuePerset(eventPreset.preset.colums[key])
                    eventsHistory = eventsHistory.andWhereRaw(`JSON_CONTAINS(diff, ${value}, )`)
                }

                const jsonFindStr = "'$." + keys.join("', '$.") + "'"
                eventsHistory = eventsHistory
                    .whereRaw(`JSON_CONTAINS_PATH(diff, 'all', ${jsonFindStr}) = 1`)
                    .whereNotNull(eventPreset.table + "_id")
                for (let eventHistory of eventsHistory) {
                    const is_complete =
                        response.push({
                            history_id: eventHistory.id,
                            event_confirm_preset_id: eventPreset.id,
                            history: eventHistory,
                            event_confirm_preset: eventPreset,
                            confirm: indexEvents[[eventHistory.id, eventPreset.id]],
                            is_complete: 
                    })
                }
            }
        }
    }
}