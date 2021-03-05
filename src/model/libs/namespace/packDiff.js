//@ts-check
"use strict"

/**@typedef { import("deepdash").default } deepdashType*/
//@SuppressWarnings("javascript:S1110")
const deepdash = /**@type {deepdashType}*/ (/**@type {*}*/(require("deepdash")))
const lodash = require("lodash")
const _ = deepdash(lodash)
const dayjs = require("dayjs")
/**
 * Отвечает за кодеривоание декодирование информации в поле diff истории
 * @class
 */
module.exports = class PackDiff {

    /**
     * Этим флагом помечаются удаленные поля
     * @type {string}
     * @private
     */
    static jsonDelFlag = "deleteV1StGXR8"

    /**
     * Возвращает объект с информацией об изменении строки таблицы
     * Возвращает различия между старой записью и новой
     * deleteFlag в обьекте нулевого уровня отсудствует
     * @param {*} newData
     * @param {*} oldData
     */
    static pack(newData, oldData) {
        const diffJson = this.packJson(newData, oldData)
        const res = _.mapValues(diffJson, x=> x === this.jsonDelFlag ? undefined : x)
        return res
    }

    /**
     * Возвращает объект с информацией об изменении json поля
     * Возвращает различия между старой записью и новой
     * @private
     * @param {*} newData
     * @param {*} oldData
     */
    static packJson(newData, oldData) {
        const newCopy = _.cloneDeep(newData)
        const oldCopy = _.cloneDeep(oldData)
        /**@type {*} */
        const diffObj = {}
        const allKeys = _.concat(_.keys(newCopy), _.keys(oldCopy))
        for (let key of allKeys) {
            const x = this.oneFieldDiff(newCopy?.[key], oldCopy?.[key])
            if (x !== undefined) {
                diffObj[key] = x
            }
        }
        return _.isEmpty(diffObj) ? undefined : diffObj
    }

    /**
     * Сравнивает новое поле со старым и выдает результат
     * @private
     * @param {*} newData 
     * @param {*} oldData 
     */
    static oneFieldDiff(newData, oldData) {
        if (newData === undefined) {
            return this.jsonDelFlag
        } else if (oldData instanceof Date) {
            return this.dataCompare(newData, oldData)
        } else if (typeof newData === "object") {
            return this.packJson(newData, oldData)
        } else if (newData !== oldData) {
            return newData
        }
    }

    /**
     * Сравнивает даты возвращает новую если она отличается от старой
     * @private
     * @param {*} newData 
     * @param {*} oldData 
     */
    static dataCompare(newData, oldData) {
        if (newData === null && oldData !== null) {
            return newData
        }
        const newDate = dayjs(newData).toISOString()
        const oldDate = dayjs(oldData).toISOString()
        if (newDate !== oldDate) {
            return newDate
        }
    }

    /**
     * Распоковывает данные из diff используя текущий обькт и разницу,
     * возвращает объект
     * @param {*} diff 
     * @param {Function} getOldDataFn 
     */
    static async unpack(diff, getOldDataFn) {
        /**@type {*}*/
        const diffJsonOnly = {}
        const jsonKeys = _.keys(_.pickBy(diff, _.isObject))
        if (jsonKeys.length) {
            const actual = await getOldDataFn() ?? {}
            for (let key of jsonKeys) {
                diffJsonOnly[key] = this.unpackOneJson(diff[key], actual[key])
            }
        }
        return { ...diff, ...diffJsonOnly }
    }


    /**
     * Возвращает объект полученный наложением diff
     * для json полей
     * @private
     * @param {*} newData 
     * @param {*} oldData 
     */
    static unpackOneJson(newData, oldData) {
        const unionData = _.merge(oldData, newData)
        return _.mapValuesDeep(unionData,
            x => x === this.jsonDelFlag ? undefined : x,
            { leavesOnly: true })

    }
}