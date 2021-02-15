//@ts-check
"use srtict"

const _ = require("lodash")
const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)

module.exports = class PresetParse {

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
     * @private
     * @returns {boolean}
     */
    substitution(logic, valObj) {
        for (let key in valObj) {
            const regExp = new RegExp(`^${key}$`, "gi")
            logic = logic.raplace(regExp, valObj[key])
        }
        return eval(logic)
    }

    /**
     * Проверяет на соответсткие пресету
     * @param {*} newData Новые данные
     * @param {*} oldData данные до изменений
     * @param {*} presetRaw пресет
     */
    async isDataMatchPreset(newData, oldData, presetRaw) {
        const presetDefault = this.convertToDefault(presetRaw)
        const presetOnlyValue = await this.sqlResolving(presetDefault)
        presetOnlyValue.columns = _.mapValues(presetOnlyValue.columns, (value, keys) => {
           return (this.columnResolving(newData[keys], value.new) &&
                this.columnResolving(oldData[keys], value.old)) 
        })

        return this.substitution(presetOnlyValue.logic, presetOnlyValue.columns)
    }
}