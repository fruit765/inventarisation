//@ts-check
"use srtict"

const _ = require("lodash")
const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)

module.exports = class PresetParse {

    /**
     * Версия с мемоизированными sql запросами confirmCompletion
     */
    static confirmCompletionMemoize() {
        const queryMemo = _.memoize(this.knexQuery)
        const that = new Proxy(this, {
            get(target, prop) {
                if (prop === "knexQuery") {
                    return queryMemo
                } else {
                    return Reflect.get(target, prop)
                }
            }
        })
        return this.confirmCompletion.bind(that)
    }

    /**
     * Переводит сокращенный вид к полному для формата подтверждений
     * @param {*} preset 
     * @param {*} hisRec
     */
    static async confirmCompletion(preset, hisRec) {
        const presetLocal = _.cloneDeep(preset)
        this.repHistoryRec(presetLocal, hisRec)
        await this.confirmAllSqlToValue(presetLocal)
        return presetLocal
    }

    /**
     * Заполняет все данные формата ${value}, полями из истории или любого другого объекта
     * @param {*} preset 
     * @param {*} hisRec
     * @private
     */
    static repHistoryRec(preset, hisRec) {
        for (let key in preset) {
            const val = preset[key]
            if (typeof val === "string") {
                val.match(/(?<=\${)(.+?)(?=})/g)?.forEach((value) => {
                    preset[key] = preset[key].replace(new RegExp("\\${" + value + "}", "g"), _.get(hisRec, value))
                })
            } else if (typeof val === "object") {
                this.repHistoryRec(val, hisRec)
            }
        }
    }

    /**
     * Заменяет в пресете подтверждений все sql значения, на обычные value значения
     * @param {*} preset 
     * @private
     */
    static async confirmAllSqlToValue(preset) {
        if (Object.keys(preset).includes("sql")) {
            const sql = _.flatten(await this.selectSqlStrToValue(preset.sql))
            preset.value = _.union(preset.value, sql)
            delete (preset.sql)
        }

        for (let key in preset) {
            if(key !== "value" && key !== "sql" && typeof preset[key] === "object") {
                this.confirmAllSqlToValue(preset[key])
            }
        }
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
     * возвращает номер групп в которых разрешенно подтверждение от данного актора
     * @param {*} needConfirm 
     * @param {number} actorId 
     */
    static async getConfirmsGroup(needConfirm, actorId) {
        /**@type {string[]}*/
        const groupArray = _.transform(needConfirm, (/**@type {string[]}*/result, value, key) => {
            if (needConfirm[key].value.includes(actorId)) {
                result.push(String(key))
            }
        }, [])
        return groupArray
    }

    /**
     * Заменяет personal, на значения id
     * @param {*} preset 
     */
    static async repPersonalId(preset) {
        const personalIdsRaw = preset.personal
        const personalRepRaw = []
        for (let key in personalIdsRaw) {
            personalRepRaw.push(preset.confirms[personalIdsRaw[key]])
        }
        const personalRepVal = _.map(personalRepRaw, "value")
        return Object.assign({}, preset, { personal: _.flatten(personalRepVal) })
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
                const dbRes = await this.knexQuery(query)
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
     * Делает запрос в базу данных
     * @param {string} query
     * @private
     */
    static async knexQuery(query) {
        return knex.raw(query).then(x => x[0])
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