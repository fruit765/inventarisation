//@ts-check
"use strict"
const _ = require("lodash")
const dayjs = require("dayjs")
/**
 * Отвечает за кодеривоание декодирование информации в поле diff истории
 * @class
 */
module.exports = class PackDiff {

    /**
     * Возвращает объект с информацией об изменении объекта
     * Возвращает различия между старой записью и новой
     * @param {*} newData
     * @param {*} oldData
     */
    static pack(newData, oldData) {
        const newCopy = _.cloneDeep(newData)
        const oldCopy = _.cloneDeep(oldData)
        /**@type {*} */
        const diffObj = {}
        const allKeys = _.concat(_.keys(newCopy), _.keys(oldCopy))
        for (let key of allKeys) {
            diffObj[key] = this.oneFieldDiff(newCopy[key], oldCopy[key])
        }
        return diffObj
    }

    static async unpack(diff, getOldDataFn) {
        const actual = await getActualFn()
    }

    /**
     * Сравнивает новое поле со старым и выдает результат
     * @private
     * @param {*} newData 
     * @param {*} oldData 
     */
    static oneFieldDiff(newData, oldData) {
        if (this.isPrimitiveDiff(newData, oldData)) {
            return newData
        } else if (typeof oldData === "object") {
            return this.diffJson(newData, oldData)
        }
    }

    /**
     * Возвращает true если примитивы разные
     * @typedef {(Date | string | boolean | number | null | undefined )} compareType
     * @param {compareType} oldData 
     * @param {compareType} newData 
     * @private
     */
    static isPrimitiveDiff(newData, oldData) {
        if (typeof oldData === "boolean") {
            oldData = Number(oldData)
        }

        if (typeof newData === "boolean") {
            newData = Number(newData)
        }
        if (oldData instanceof Date) {
            console.log(newData, dayjs(newData).toISOString(), dayjs(oldData).toISOString())
        }


        if (oldData !== newData ||
            (
                (oldData instanceof Date || newData instanceof Date) &&
                (oldData === null || newData === null || dayjs(oldData).toISOString() !== dayjs(newData).toISOString())
            )
        ) {
            return true
        }
        return false
    }

    /**
     * Возвращает различия между объектами,
     * удаленные поля имеют значения в diff "undefined"
     * @param {*} originalObj 
     * @param {*} updatedObj 
     * @private
     */
    static diffJson(updatedObj, originalObj) {
        /**@type {*} */
        let diffObj
        if (_.isArray(updatedObj)) {
            diffObj = []
        } else {
            diffObj = {}
        }
        for (let key of _.concat(_.keys(originalObj), _.keys(updatedObj))) {
            if (typeof updatedObj[key] === "object") {
                diffObj[key] = this.diffObj(originalObj?.[key] ?? {}, updatedObj[key])
            } else if (originalObj[key] !== undefined && updatedObj[key] === undefined) {
                diffObj[key] = "undefined"
            } else if (this.isPrimitiveDiff(originalObj[key], updatedObj[key])) {
                diffObj[key] = updatedObj[key]
            }
        }
        return diffObj
    }

    /**
     * Дополняет json поля для всей строки для вставки в таблицу,
     * добовляет актуальные данные и удаляет свойства если значения в 
     * diff равны "undefined"
     * @param {*} diff 
     * @param {*} actual
     * @private 
     */
    static unpackDiff(diff, actual) {
        return _.mapValues(diff, (val, key) => {
            let res
            if (typeof val === "object") {
                res = this.unpackDiffObj(val, actual[key])
            } else {
                res = val
            }
            return res
        })
    }

    /**
     * Дополняет json поле для вставки в таблицу,
     * добовляет актуальные данные и удаляет свойства если значения в 
     * diff равны "undefined"
     * @param {*} diffObj 
     * @param {*} actualObj 
     * @private
     */
    static unpackDiffObj(diffObj, actualObj) {
        for (let key of _.concat(_.keys(diffObj), _.keys(actualObj))) {
            if (typeof diffObj[key] === "object") {
                this.unpackDiffObj(diffObj[key], actualObj)
            } else if (diffObj[key] === "undefined") {
                diffObj[key] = undefined
            } else if (actualObj[key] != null) {
                diffObj[key] = actualObj[key]
            }
        }
    }

    /**
     * Проверяет на наличее json полей
     * @param {*} diff 
     * @private
     */
    static hasJsonCol(diff) {
        for (let key in diff) {
            if (typeof diff[key] === "object") {
                return true
            }
            return false
        }
    }
}