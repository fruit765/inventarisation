"use strict"

const Knex = require("knex")
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
                const res = await knex.raw(query).then(x=>x[0])
                return _.map(res,Object.keys(res[0])[0])
            }))
        }

        return sqlValues
    }

    /**
     * Если приходит не массив упоковывает значение в массив
     * @param {*} value 
     */
    _warpToArray(value) {
        if (_.isArray(value)) {
            return value
        } else {
            return [value]
        }
    }

    /**
     * Собирает логическую цепочку для массива определенной длинны, счетчик нужен
     * для установки начало отсчета
     * Приходит ("foo", 3, 4), получаем "( foo4 or foo5 or foo6 )"
     * @param {*} prefix 
     * @param {*} length 
     * @param {*} counter 
     */
    _arrayAndPrefixToLogicOr(prefix, length, counter) {
        const res = []
        for (let key = counter; key < counter + length; key++) {
            res.push(prefix + counter)
            counter++
        }
        return "( " + res.join(" OR ") + " )"
    }

    /**
     * Добаляет в логическую цеопчку префикс к значеним соответствующим регулярному выражению regExpStr
     * ("=","(sql|values)", "sql1 and sql2 and =sql3 or value0") => "=sql1 and =sql2 and =sql3 or =value0"
     * @param {string} sign
     * @param {*} regExpStr 
     * @param {*} logicCh 
     */
    _addDefaultSignLogicCh(sign, regExpStr, logicCh) {
        return logicCh.trim().split(" ").map(x => {
            const regExp = new RegExp(regExpStr, "gi")
            return x.match(regExp) ? sign + x : x
        }).join(" ")
    }

    _flatternArrayWithLogicVal(logicCh, keyValues) {
        let counter = 0
        return logicCh.trim().split(" ").map(x => {
            _.forOwn(keyValues, (valArray, valType) => {
                _.forEach(valArray, (subValue, subKey) => {
                    if (x.match(new RegExp("[=<>!]" + valType + subKey + "$", "gi"))) {
                        const sign = x.match(/[=><!]/gi).join("")
                        const subValueArray = this._warpToArray(subValue)
                        const res = this._arrayAndPrefixToLogicOr(sign + valType, subValueArray.length, counter)
                        counter += subValueArray.length
                        return res
                    }
                })
            })
            return x
        }).join(" ")
    }

    _flatternArrayWithLogicColumn(logicCh, columnsVal) {
        let counter = 0
        return logicCh.trim().split(" ").map(x => {
            _.forOwn(columnsVal, (columnArray, columnName) => {
                columnArray.forEach((columnSubArray, columnKey) => {
                    if (x.match(new RegExp("^" + columnName + columnKey + "$", "gi"))) {
                        const columnSubArrayWrp = this._warpToArray(columnSubArray)
                        const res = this._arrayAndPrefixToLogicOr(columnName + columnKey, columnSubArrayWrp.length, counter)
                        counter += columnSubArrayWrp.length
                        return res
                    }
                })
            })
            return x
        }).join(" ")
    }

    _prepareLogicChVal(logicChainRaw, keyValues) {
        let logicChain = ""
        const logicArray = []
        if (typeof logicChainRaw === "string") {
            logicChain = this._addDefaultSignLogicCh("=", `^(${_.keys(keyValues).join("|")})`, logicChainRaw)
            logicChain = this._flatternArrayWithLogicVal(logicChain, keyValues)
        } else {
            _.forOwn(keyValues, (valArray, valType) => {
                _.forEach(_.flatten(valArray), (subValue, subKey) => {
                    if (subValue != null) {
                        const prefix = valType + subKey
                        logicArray.push("="+prefix)
                    }
                })
            })

            logicChain = logicArray.join(" OR ")
        }

        logicChain = `( ${logicChain} )`
        return logicChain
    }

    _prepareLogicChColumn(logicChainRaw, columnsVal) {
        let logicChain = ""
        if (typeof logicChainRaw === "string") {
            return this._flatternArrayWithLogicColumn(logicChain, columnsVal)
        } else {
            const logicArray = []
            _.forOwn(columnsVal, (column, columnName) => {
                let counter = 0
                const logicSector = column.map((columnVal, columnKey) => {
                    const res = columnName + columnKey
                    counter++
                    return res
                }).join(" OR ")
                const logicSectorHooks = "( " + logicSector + " )"
                logicArray.push(logicSectorHooks)
            })
            logicChain = logicArray.join(" AND ")
        }

        logicChain = `( ${logicChain} )`
        return logicChain
    }

    _buildQueryStrByLogicChVal(logicChain, keyValues, columnName) {
        let queryCondition = logicChain.split(" ").map(x => {
            const regExp = new RegExp(`(${_.keys(keyValues).join("|")})`, "gi")
            return x.match(regExp) ? `JSON_EXTRACT(diff, '$.${columnName}') ` + x : x
        }).join(" ")

        _.forOwn(keyValues, (valArray, valType) => {
            _.forEach(valArray, (subValue, subKey) => {
                const regExp = new RegExp(valType + subKey + "[\\s]", "gi")
                queryCondition = queryCondition.replace(regExp, subValue+" ")
            })
        })

        return `( ${queryCondition} )`
    }

    /**
     * Собирает условие на языке sql из логической цепочки и значений
     * @param {*} logicChain 
     * @param {*} columnsVal 
     */
    _buildQueryStrByLogicChCol(logicChain, columnsVal) {
        let queryCondition
        _.forOwn(columnsVal, (columnArray, columnName) => {
            _.forEach(columnArray, (columnValue, columnKey) => {
                const regExp = new RegExp(`[\\s]` + columnName + columnKey + `[\\s]`, "gi")
                queryCondition = logicChain.replace(regExp, " "+columnValue+" ")
            })
        })

        return `( ${queryCondition} )`
    }

    async _buildQueryStrByColObj(colObj, columnName) {
        const sqlValues = await this._selectSqlStrToValue(colObj.sql) //получаем 2 мерный массив [[1,3],[3,5],[6]]
        const values = colObj.values
        //подготавливает логическую цепочку, возвращает цепочку по умолчанию если она пустая, изменяет
        //ее для двумерного массива
        const logicChain = this._prepareLogicChVal(colObj.logicChain, { sql: sqlValues, values: values })
        const queryStr = this._buildQueryStrByLogicChVal(logicChain, { sql: _.flatten(sqlValues), values: _.flatten(values) }, columnName)
        return queryStr
    }

    async _buildQueryStrByPreset(preset) {

        const columns =_.mapValues(preset.columns, (columnVal, columnName) => {
            return columnVal.new ? columnVal.new : columnVal
        })

        const columnsValues = {}
        for (let columnName in columns) {
            columnsValues[columnName] = await Promise.all(this._warpToArray(columns[columnName]).map(x => {
                return this._buildQueryStrByColObj(x, columnName)
            }))
        }

        const logicChain = this._prepareLogicChColumn(preset.logicChain, columnsValues)
        const columnsValuesFlattern = _.mapValues(columnsValues, (val)=>{
            return _.flatten(val)
        })
        const queryStr = this._buildQueryStrByLogicChCol(logicChain, columnsValuesFlattern)
        return queryStr
    }

    async getByPreset(tableName, preset) {
        const cond = await this._buildQueryStrByPreset(preset)
        return History.query().whereRaw(cond)
    }
}