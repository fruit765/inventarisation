//@ts-check
"use srtict"

const _ = require("lodash")
const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)

module.exports = class presetParse {

    constructor() {

    }

    /**
     * На входе массив select запросов
     * Делает запрос, получаем массив значений
     * @param {string[]} sqlStrings
     * @private
     */
    async selectSqlStrToValue(sqlStrings) {
        const sqlRes = []
        for (let sqlString of sqlStrings) {
            const query = sqlString.split(";")[0].trim().match(/^select.*$/)?.[0]
            if (query) {
                const dbRes = await knex.raw(query).then(x => x[0])
                const firstKey = Object.keys(dbRes[0])[0]
                const resArray = _.groupBy(dbRes, firstKey)[firstKey]
                sqlRes.push(resArray[0] ? resArray : [NaN])
            } else {
                sqlRes.push([NaN])
            }
        }

        return sqlRes
    }

    /**
     * Переводит сокращенный вид к полному
     * @param {*} preset 
     * @private
     */
    convertToDefault(preset) {
        return preset
    }

    /**
     * Изменяет объект, заменяет запросы на значения
     * @param {*} preset 
     * @private
     */
    async sqlResolving(preset) {
        for (let column of preset.columns) {
            column.new.sql = await this.selectSqlStrToValue(column.new.sql)
            column.old.sql = await this.selectSqlStrToValue(column.old.sql)
        }
        return preset
    }

    /**
     * проверяет значение с каждым в массиве используя полученный знак сравнения
     * @param {*} valueArray 
     * @param {*} data 
     * @param {string} sign
     * @private
     */
    arrayResolving(valueArray, data, sign) {
        /**@type {*[]} */
        const valueArrayStr = valueArray.map((/**@type {*}*/value) => {
            return String(value)
        })
        const dataStr = String(data)

        switch (sign) {
            case ">":
                return dataStr > String(Math.max(...valueArrayStr))
            case "<":
                return dataStr < String(Math.min(...valueArrayStr))
            case "=":
                return valueArrayStr.includes(dataStr)
            case ">=":
                return dataStr >= String(Math.max(...valueArrayStr))
            case "<=":
                return dataStr <= String(Math.min(...valueArrayStr))
            case "!=":
                return !valueArrayStr.includes(dataStr)
            default:
                return false
        }
    }

    /**
     * Сверяет пресет с данными и преобразует обьект колонки в логическое значение
     * @param {*} data 
     * @param {*} presetColumn 
     * @returns {boolean}
     * @private
     */
    columnResolving(data, presetColumn) {
        /**@type {string[]} */
        const logicValArray = presetColumn.logic.replace(/\s+/gi, " ").split(" ")
        const logicArray = logicValArray.map(
            /**
             * Меняем сравнения в логической цепочки на логические значения
             * @param {*} value 
             * @param {*} key 
             */
            (value, key) => {
                const sqlNumber = value.match(/sql\d+$/gi)?.[0].slice(3)
                const valueNumber = value.match(/value\d+$/gi)?.[0].slice(5)
                let res
                if (sqlNumber != undefined) {
                    res = this.arrayResolving(presetColumn.sql[sqlNumber], data, logicArray[key - 1])
                    logicArray[key - 1] = ""
                } else if (valueNumber != undefined) {
                    res = this.arrayResolving(presetColumn.value[valueNumber], data, logicArray[key - 1])
                    logicArray[key - 1] = ""
                } else if (value.match(/undefined/gi)) {
                    if (logicArray[key - 1] === "!=") {
                        res = !_.isUndefined(data)
                    } else {
                        res = _.isUndefined(data)
                    }
                } else {
                    res = value
                }
                return String(res)

            }
        )

        return eval(logicArray.join(" ").replace(/\s+/gi, " "))
    }

    /**
     * Подставляет данные в логическую цепочку
     * и возвращает значение всей цепочки
     * @param {*} logic 
     * @param {*} valObj 
     */
    substitution(logic, valObj) {
        for (let key in valObj) {
            const regExp = new RegExp(`^${key}$`, "gi")
            logic = logic.raplace(regExp, valObj[key])
        }
        return eval(logic)
    }

    async isDataMatchPreset(newData, oldData, presetRaw) {
        const presetDefault = this.convertToDefault(presetRaw)
        const presetOnlyValue = await this.sqlResolving(presetDefault)
        presetOnlyValue.columns = _.mapValues(presetOnlyValue.columns, (value, keys) => {
           return (this.columnResolving(newData[keys], value.new) &&
                this.columnResolving(oldData[keys], value.old)) 
        })

        return this.substitution(presetOnlyValue.logic, presetOnlyValue.columns)
    }



    /**
     * Если приходит не массив упоковывает значение в массив
     * @param {*} value 
     * @private
     */
    warpToArray(value) {
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
     * @param {string} prefix 
     * @param {number} length 
     * @param {number} counter 
     * @private
     */
    arrayAndPrefixToLogicOr(prefix, length, counter) {
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
     * @private
     */
    addDefaultSignLogicCh(sign, regExpStr, logicCh) {
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
                        const subValueArray = this.warpToArray(subValue)
                        const res = this.arrayAndPrefixToLogicOr(sign + valType, subValueArray.length, counter)
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
                        const columnSubArrayWrp = this.warpToArray(columnSubArray)
                        const res = this.arrayAndPrefixToLogicOr(columnName + columnKey, columnSubArrayWrp.length, counter)
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
            logicChain = this.addDefaultSignLogicCh("=", `^(${_.keys(keyValues).join("|")})`, logicChainRaw)
            logicChain = this._flatternArrayWithLogicVal(logicChain, keyValues)
        } else {
            _.forOwn(keyValues, (valArray, valType) => {
                _.forEach(_.flatten(valArray), (subValue, subKey) => {
                    if (subValue != null) {
                        const prefix = valType + subKey
                        logicArray.push("=" + prefix)
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
                queryCondition = queryCondition.replace(regExp, subValue + " ")
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
                queryCondition = logicChain.replace(regExp, " " + columnValue + " ")
            })
        })

        return `( ${queryCondition} )`
    }

    async _buildQueryStrByColObj(colObj, columnName) {
        const sqlValues = await this.selectSqlStrToValue(colObj.sql) //получаем 2 мерный массив [[1,3],[3,5],[6]]
        const values = colObj.values
        //подготавливает логическую цепочку, возвращает цепочку по умолчанию если она пустая, изменяет
        //ее для двумерного массива
        const logicChain = this._prepareLogicChVal(colObj.logicChain, { sql: sqlValues, values: values })
        const queryStr = this._buildQueryStrByLogicChVal(logicChain, { sql: _.flatten(sqlValues), values: _.flatten(values) }, columnName)
        return queryStr
    }

    async _buildQueryStrByPreset(preset) {

        const columns = _.mapValues(preset.columns, (columnVal, columnName) => {
            return columnVal.new ? columnVal.new : columnVal
        })

        const columnsValues = {}
        for (let columnName in columns) {
            columnsValues[columnName] = await Promise.all(this.warpToArray(columns[columnName]).map(x => {
                return this._buildQueryStrByColObj(x, columnName)
            }))
        }

        const logicChain = this._prepareLogicChColumn(preset.logicChain, columnsValues)
        const columnsValuesFlattern = _.mapValues(columnsValues, (val) => {
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