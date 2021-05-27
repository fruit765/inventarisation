//@ts-check
"use strict"

/**@typedef { import("deepdash").default } deepdashType*/

const deepdash = /**@type {deepdashType}*/ (/**@type {*}*/(require("deepdash"))) //NOSONAR
const lodash = require("lodash")
const _ = deepdash(lodash)
const dayjs = require("dayjs")
/**
 * Отвечает за кодеривоание декодирование информации в поле diff истории
 * @module packDiff
 */


/**
 * Этим флагом помечаются удаленные поля
 * @type {string}
 */
const jsonDelFlag = "deleteV1StGXR8"

/**
 * Возвращает объект с информацией об изменении строки таблицы
 * Возвращает различия между старой записью и новой
 * deleteFlag в обьекте нулевого уровня отсудствует
 * @param {*} newData
 * @param {*} oldData
 */
function pack(newData, oldData) {
    const diffJson = packJson(newData, oldData)
    const res = _.omitBy(diffJson, (/** @type {string} */ x) => x === jsonDelFlag)
    return res
}

/**
 * Возвращает объект с информацией об изменении json поля
 * Возвращает различия между старой записью и новой
 * @param {*} newData
 * @param {*} oldData
 */
function packJson(newData, oldData) {
    if (newData === undefined) {
        return jsonDelFlag
    } else if (oldData instanceof Date) {
        return dataCompare(newData, oldData)
    } else if (_.isObject(newData)) {
        /**@type {any} */
        const res = {}
        const allKeys = _.union(_.keys(newData), _.keys(oldData))
        for(let key of allKeys) {
            const y = packJson(/**@type {any}*/(newData)[key], oldData?.[key])
            if(y !== undefined) {
                res[key] = y
            }
        }
        return res
    } else if (newData !== oldData) {
        return newData
    }
}

/**
 * Сравнивает даты возвращает новую если она отличается от старой
 * @param {*} newData 
 * @param {*} oldData 
 */
function dataCompare(newData, oldData) {
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
async function unpack(diff, getOldDataFn) {
    /**@type {*}*/
    const diffJsonOnly = {}
    const jsonKeys = _.keys(_.pickBy(diff, _.isObject))
    if (jsonKeys.length) {
        const actual = await getOldDataFn() ?? {}
        for (let key of jsonKeys) {
            diffJsonOnly[key] = unpackOneJson(diff[key], actual[key])
        }
    }
    const res = { ...diff, ...diffJsonOnly }
    return res
}


/**
 * Возвращает объект полученный наложением diff
 * для json полей
 * @param {*} newData 
 * @param {*} oldData 
 */
function unpackOneJson(newData, oldData) {
    const unionData = _.merge(oldData, newData)
    const res = delJsonDelFlag(unionData)
    return res

}

/**
 * Удаляет JsonDelFlag c обьектов 
 * @param {*} data 
 */
function delJsonDelFlag(data) {
    if (_.isObject(data)) {
        const resObj = new /**@type {any}*/(data).__proto__.constructor()
        for (let key in data) {
            const res = delJsonDelFlag(/**@type {any}*/(data)[key])
            if(res !== undefined) {
                resObj[key] = res
            }
        }
        return resObj
    } else if (data !== jsonDelFlag) {
        return data
    }
}

module.exports = { pack, unpack }