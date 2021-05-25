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
    //console.log(newData?.plan, oldData?.plan)
    const diffJson = packJson(newData, oldData)
    //console.log(diffJson)
    const res = _.omitBy(diffJson, (/** @type {string} */ x) => x === jsonDelFlag)
    //console.log(res?.plan?.blocks)
    return res
}

// /**
//  * Возвращает объект с информацией об изменении json поля
//  * Возвращает различия между старой записью и новой
//  * @param {*} newData
//  * @param {*} oldData
//  */
// function packJson(newData, oldData) {
//     /**@type {*} */
//     //const diffObj = 
//     const allKeys = _.union(_.keys(newData), _.keys(oldData))
//     for (let key of allKeys) {
//         const x = oneFieldDiff(newData?.[key], oldData?.[key])
//         if (x !== undefined) {
//             diffObj[key] = x
//         }
//     }
//     return _.isEmpty(diffObj) ? undefined : diffObj
// }

/**
 * Возвращает объект с информацией об изменении json поля
 * Возвращает различия между старой записью и новой
 * @param {*} newData
 * @param {*} oldData
 */
function packJson(newData, oldData) {
    const newCopy = _.cloneDeep(newData)
    const oldCopy = _.cloneDeep(oldData)
    /**@type {*} */
    const diffObj = {}
    const allKeys = _.union(_.keys(newCopy), _.keys(oldCopy))
    for (let key of allKeys) {
        const x = oneFieldDiff(newCopy?.[key], oldCopy?.[key])
        if (x !== undefined) {
            diffObj[key] = x
        }
    }
    return _.isEmpty(diffObj) ? undefined : diffObj
}

/**
 * Сравнивает новое поле со старым и выдает результат
 * @param {*} newData 
 * @param {*} oldData 
 */
function oneFieldDiff(newData, oldData) {
    if (newData === undefined) {
        return jsonDelFlag
    } else if (oldData instanceof Date) {
        return dataCompare(newData, oldData)
    } else if (typeof newData === "object") {
        return packJson(newData, oldData)
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
    //console.log(diff?.plan?.blocks)
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
    //console.log(res?.plan?.blocks)
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
    if (typeof data === "object") {
        const resObj = new data.__proto__.constructor()
        for (let key in data) {
            const res = delJsonDelFlag(data[key])
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