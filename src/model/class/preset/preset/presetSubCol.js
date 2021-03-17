//@ts-check
// {
//     "sql": [
//         "select id from status where status = 'given'"
//     ],
//     "value": [
//         1,2
//     ]
//         "logic": "sql0 && (value0 || value1)"
// }
"use strict"

const _ = require("lodash")
const Knex = require("knex")
const dbConfig = require("../../../../../serverConfig").db
const { sqlsToValues } = require("../../../libs/queryHelper")
const knex = Knex(dbConfig)

module.exports = class PresetSubCol {
    /**
     * @typedef {Object} presetSubCol
     * @property {string | any[]} [value]
     * @property {string | string[]} [sql]
     * @property {string} [logic]
     * 
     * @param {presetSubCol} preset 
     */
    constructor(preset) {
        /**
         * @type {(undefined | Promise<boolean>)}
         * @private
         */
        this.initAttr = undefined

        /**
         * @private
         * @type {any[]}
         */
        this.value = typeof preset.value === "string" ? [preset.value] : (preset.value ?? [])
        /**
         * @private
         * @type {string[]}
         */
        this.sql = typeof preset.sql === "string" ? [preset.sql] : (preset.sql ?? [])
        /**
         * @private
         * @type {string}
         */
        this.logic = preset.logic ?? this.logicDefault()
        /**
         * @public
         * @type {string}
         */
        this.evalLogic = ""
        /**
         * @private
         * @type {string[]}
         */
        this.valueKeysInLogic = this.logic.match(/(?<=value)[0-9]+/gi) ?? []
        /**
         * @private
         * @type {string[]}
         */
        this.sqlKeysInLogic = this.logic.match(/(?<=sql)[0-9]+/gi) ?? []
        /**
         * @private
         * @type {number}
         */
        this.maxValueNumber = Math.max(...this.valueKeysInLogic.map(Number))
        this.maxValueNumber = Number.isFinite(this.maxValueNumber) ? this.maxValueNumber : -1
        /**
         * @private
         * @type {number}
         */
        this.maxSqlNumber = Math.max(...this.sqlKeysInLogic.map(Number))
        this.maxSqlNumber = Number.isFinite(this.maxSqlNumber) ? this.maxSqlNumber : -1
        /**
         * @private
         * @type {number}
         */
        this.matchValue = NaN
        this.logicSqlToValue()
        this.init()
        this.logicToEval()
    }

    /**
     * Запускает асинхронные процессы для подготовки класса,
     * если они уже запущенны возвращает промис
     */
    async init() {
        if (this.initAttr) {
            return this.initAttr
        } else {
            this.initAttr = this.sqlToValue().then(() => true)
            return this.initAttr
        }
    }

    /**
     * Преобразует logic в logicEval строку которая при запуске через eval() возвращает
     * результат сравнения
     * сравнивается со значением находящимся в this.matchValue
     */
    logicToEval() {
        this.evalLogic = this.logic
        const valueKeys = this.logic.match(/(?<=value)[0-9]+/gi) ?? []
        for (let key of valueKeys) {
            const valueStr = new RegExp("[=><!]*\\s*value" + key + "(?![0-9])", "gi")
            const valueKeyStr = this.evalLogic.match(valueStr) ?? []
            for (let value of valueKeyStr) {
                const sign = value.match(/[=><!]+/gi)?.[0] ?? "="
                const fnStr = `this.atomicCheck("${sign}",${key},this.matchValue)`
                this.evalLogic = this.evalLogic.replace(new RegExp(valueStr, "i"), fnStr)
            }
        }
    }

    /**
     * Делает проверку по знаку между значением с присета и полученным значением
     * @param {string} sign 
     * @param {number} key 
     * @param {*} value 
     * @private
     */
    atomicCheck(sign, key, value) {
        let flattenValue = (typeof this.value[key] !== "object") ?
            [this.value[key]] : _.flattenDeep(this.value[key])
        switch (sign) {
            case "=":
            case "==":
                for (let val of flattenValue) {
                    if (value == val) {
                        return true
                    }
                }
                return false
            case "=>":
                for (let val of flattenValue) {
                    if (value < val) {
                        return false
                    }
                }
                return true
            case "=<":
                for (let val of flattenValue) {
                    if (value > val) {
                        return false
                    }
                }
                return true
            case "!=":
                for (let val of flattenValue) {
                    if (value == val) {
                        return false
                    }
                }
                return true
            case ">":
                for (let val of flattenValue) {
                    if (value <= val) {
                        return false
                    }
                }
                return true
            case "<":
                for (let val of flattenValue) {
                    if (value >= val) {
                        return false
                    }
                }
                return true
        }
    }

    /**
     * строит логическую цепочку из всех значений с отношением ИЛИ
     * "sql0 || sql1 || value0 || value1"
     * @returns {string}
     * @private
     */
    logicDefault() {
        const sqlKeys = _.keys(this.sql)
        const sqlKeysNamed = sqlKeys.map(x => "sql" + x)
        const valueKeys = _.keys(this.value)
        const valueKeysNamed = valueKeys.map(x => "value" + x)
        const keysNamed = _.concat(sqlKeysNamed, valueKeysNamed)
        return keysNamed.join(" || ")
    }

    /**
     * Меняет все sql значения в логической цепочке на value
     * "sql0 sql1 value0 value1" => "value2 value3 value0 value1"
     * @private
     */
    logicSqlToValue() {
        for (let key of this.sqlKeysInLogic) {
            const sqlElement = new RegExp("sql" + key + "(?![0-9])", "gi")
            this.logic = this.logic.replace(sqlElement, "value" + (Number(key) + this.maxValueNumber + 1))
        }
    }

    /**
     * Делает запросы переводя все sql значения в обычные value
     */
    async sqlToValue() {
        const sqlVal = await sqlsToValues(this.sql)
        this.value = _.concat(this.value, sqlVal)
    }

    /**
     * Проверяет значение на соответствие пресету
     * @param {*} data 
     */
    async match(data) {
        await this.init()
        if (data === undefined) {
            return false
        }
        this.matchValue = data
        const res = Boolean(eval(this.evalLogic))
        return res
    }
}