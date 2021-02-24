//@ts-check
"use srtict"

const _ = require("lodash")
const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)

module.exports = class PresetParse {

    /**
     * Переводит сокращенный вид к полному для формата подтверждений
     * @param {*} preset 
     * @private
     */
    static confirmCompletion(preset) {
        return preset
    }

    /**
     * Заменяет в обьекте все sql значения, но обычные value значения
     * @param {*} confirmsBlocks 
     */
    static async confirmSqlToValue (confirmsBlocks) {
        for (let key in confirmsBlocks) {
            if(confirmsBlocks[key]?.sql?.[0]) {
                confirmsBlocks[key].value = (await this.selectSqlStrToValue(confirmsBlocks[key].sql))[0]
                confirmsBlocks[key].sql = undefined
            }
        }
        return confirmsBlocks
    }

    /**
     * Возвращает обьект который определяет какие подтверждения еще требуются
     * @param {*} presetConfirms 
     * @param {*} alreadyConfirms 
     */
    static needConfirm(presetConfirms, alreadyConfirms) {
        const alreadyKeys = Object.keys(alreadyConfirms)
        return _.pickBy(presetConfirms, x => !alreadyKeys.includes(x))
    }

    /**
     * 
     * @param {*} needConfirm 
     * @param {number} actorId 
     */
    static async getConfirmsGroup(needConfirm, actorId) {
        const needConfirmValOnly = await this.confirmSqlToValue(needConfirm)
        /**@type {string[]}*/
        const groupArray = _.transform(needConfirmValOnly, (/**@type {string[]}*/result, value, key) => {
            if(needConfirmValOnly[key].value.includes(actorId)) {
                result.push(String(key))
            }
        }, [])
        return groupArray
    }

    /**
     * На входе массив select запросов
     * Делает запрос, получаем массив значений
     * @param {string[]} sqlStrings
     * @private
     */
    static async selectSqlStrToValue(sqlStrings) {
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
     * Переводит сокращенный вид к полному для пресета
     * @param {*} preset 
     * @private
     */
    static presetCompletion(preset) {
        return preset
    }

    /**
     * Изменяет объект, заменяет запросы на значения
     * @param {*} preset 
     * @private
     */
    static async sqlResolving(preset) {
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
    static arrayResolving(valueArray, data, sign) {
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
    static columnResolving(data, presetColumn) {
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
    static substitution(logic, valObj) {
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
    static async isDataMatchPreset(newData, oldData, presetRaw) {
        const presetDefault = this.presetCompletion(presetRaw)
        const presetOnlyValue = await this.sqlResolving(presetDefault)
        presetOnlyValue.columns = _.mapValues(presetOnlyValue.columns, (value, keys) => {
           return (this.columnResolving(newData[keys], value.new) &&
                this.columnResolving(oldData[keys], value.old)) 
        })

        return this.substitution(presetOnlyValue.logic, presetOnlyValue.columns)
    }
}