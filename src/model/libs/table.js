// @ts-check
/**
 * @typedef { import("objection") } Objection
 * @typedef { import("../../types/index").tableOptions } tableOptions
 */

"use strict"

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)
const _ = require("lodash")
const createError = require('http-errors')
const { diff } = require("deep-object-diff")

const History = require("../orm/history")
const Events = require("./events")
const GlobalHistory = require("./globalHistory")

module.exports = class Table {
    /**
     * 
     * @param {Objection["Model"]} tableClass 
     * @param { tableOptions } options
     */
    constructor(tableClass, options) {
        if (!options) {
            options = {}
        }
        /**
         * @protected 
         * @type {{actor_id?: number}}
         */
        this.options = {}
        /**
         * @protected 
         * @readonly
         */
        this.tableClass = tableClass
        /**
        * @protected
        * @readonly
        */
        this.events = new Events(this.tableClass.tableName)
        /**
        * @protected
        * @readonly
        */
        this.history = new GlobalHistory(this.tableClass.tableName)
        /**
        * @protected
        * @readonly
        */
        this.tableName = this.tableClass.tableName
        /**
         * @protected
         * @type {{trx: *}}
         */
        this.trx = { trx: null }

        options.isSaveHistory = _.isNil(options.isSaveHistory) ? true : Boolean(options.isSaveHistory)

        this.setOpt(options)
    }

    setOpt(options) {
        this.setActorId(options.actorId)
        this.setSaveHistory(options.isSaveHistory)
        return this
    }

    setActorId(actorId) {
        if (actorId) {
            this.options.actor_id = actorId
        }
        return this
    }

    setSaveHistory(isSaveHistory) {
        if (isSaveHistory != undefined) {
            if (isSaveHistory) {
                /**@protected*/
                this.hisColName = this.tableName + "_id"
                this._isSaveHistory = knex.schema.hasColumn(History.tableName, this.hisColName)
            } else {
                this._isSaveHistory = Promise.resolve(false)
            }
        }
    }

    /**
     * Возвращает обьект не содержащий ключи с пустыми значениями
     * @param {*} obj 
     * @private
     */
    delUndefined(obj) {
        const result = {}
        for (let key in obj) {
            if (obj[key] !== undefined) {
                result[key] = obj[key]
            }
        }

        return result
    }

    async _checkEvents(historyId) {

    }

    /**
     * Сохраняет историю
     * @param {*} data новые данные
     * @param {string} actionTag тег действия
     * @returns {Promise<{[key: string]: any, id: number}>} Возвращает поле из таблицы истории
     * @private
     */
    async saveHistory(data, actionTag) {
        const isSaveHistory = await this._isSaveHistory
        const dataWithoutId = this.delUndefined(_.omit(data, "id"))

        if (!isSaveHistory ||
            (!Object.keys(dataWithoutId).length && actionTag !== "delete") ||
            this.options.actor_id == undefined) {
            return null
        }

        const historyInsertData = {}
        historyInsertData[this.hisColName] = data.id
        historyInsertData["actor_id"] = this.options.actor_id
        historyInsertData["diff"] = JSON.stringify(dataWithoutId)
        historyInsertData["action_tag"] = actionTag
        const hisRec = await History.query(this.trx.trx).insert(historyInsertData)
        await this.history.checkAndGenEvents(hisRec.id)
        return hisRec
    }

    /**
     * Получает текущие данные таблицы
     * @param {number} id 
     * @private
     */
    async getActualData(id) {
        let actualData = await this.tableClass.query().findById(id)
        if (!actualData) {
            throw this.createError400Pattern("id", "This id was not found")
        }
        return actualData
    }

    /**
     * Возвращает разницу между оригинальным и обновленны объектом
     * @param {*} originalObj 
     * @param {*} updatedObj 
     */
    diff(originalObj, updatedObj) {
        return this.delUndefined(diff(originalObj, updatedObj))
    }

    /**
     * Применяет JSON.stringify ко всем вложенным объектам
     * @param {*} data 
     * @private
     */
    stringifyColJSON(data) {
        const fillteredData = {}
        for (let key in data) {
            if (typeof data[key] === "object") {
                fillteredData[key] = JSON.stringify(data[key])
            } else {
                fillteredData[key] = data[key]
            }
        }
        return fillteredData
    }

    /**
     * Возвращает массив оборудования с неподтвержденными статусами
     * @returns {Promise<Array<Object>>}
     */
    async getTabUnconfStat() {
        const tableData = await this.tableClass.query()
        /**@type {Object<number,Object>} */
        let tableDataIdKey = _.keyBy(tableData, "id")
        /**@type {Array<Object>} */
        const tableDataUnconf = await this.events.getUnconfirmData()
        for (let elem of tableDataUnconf) {
            Object.assign(tableDataIdKey[elem.id], elem)
        }
        /**@type {Array<Object>} */
        const tableWithUnfonfData = _.values(tableDataIdKey)
        return tableWithUnfonfData
    }

    async insertAndFetch(data) {
        const readyToInsert = this.stringifyColJSON(data)
        return this.tableClass.transaction(async trx => {
            const insertRow = await this.tableClass.query(trx).insertAndFetch(readyToInsert)
            await this.saveHistory(insertRow, "insert", trx)
            return insertRow
        })
    }

    /**
     * Изменяет данные и возвращает объект с неподтвержденными данными
     * @param {*} data 
     */
    async patchAndFetch(data) {
        const id = await this.patch(data)
        return this.events.getUnconfirmDataById(id)
    }

    // /**
    //  * Добавляет данные в таблицу возвражает id записи
    //  * @param {*} data 
    //  * @returns {Promise<number>}
    //  */
    // async patch(data) {
    //     const actualData = await this.getActualData(data.id)
    //     const onlyModData = this.diff(actualData, data)
    //     const readyToPatch = this.stringifyColJSON(data)
    //     await this.startTransaction(async () => {
    //         if (await this._isSaveHistory) {
    //             const hisRec = await this.saveHistory(onlyModData, "patch")
    //             await this.history.commitHisRec(hisRec.id)
    //         } else {
    //             await this.tableClass.query(this.trx.trx)
    //                 .findById(data.id)
    //                 .patch(_.omit(readyToPatch, "id"))
    //         }
    //     })
    //     return data.id
    // }

    createError400Pattern(dataPath, message) {
        const err = createError(400)
        err.message = [{
            "dataPath": "." + dataPath,
            "message": message
        }]
        return err
    }

    /**
     * Исполняет указанное действие
     * Возвращает id измененной записи
     * @param {*} data 
     * @param {*} actionTag 
     * @protected
     */
    async applyAction(data, actionTag) {
        return this.startTransaction(async () => {
            if (await this._isSaveHistory) {

            } else {
                const genHistRec = await this.history.genHistRec(data, actionTag)
                const patchHisRec = await this.history.applyHisRec(genHistRec)
            }

            const hisRec = await this.saveHistory(data, actionTag)
            const id = await this.history.commitHisRec(hisRec.id)
            return id
        })
    }

    async deleteById(id) {
        return this.applyAction({ id }, "delete")
    }

    /**
     * Добавляет данные в таблицу возвражает id записи
     * @param {*} data 
     * @returns {Promise<number>}
     */
    async patch(data) {
        return this.applyAction(data, "patch")
    }

    // async delete(findData) {
    //     return this.startTransaction(async () => {
    //         const deletedData = await this.tableClass.query(this.trx.trx).where(findData)
    //         if (deletedData[0]) {
    //             const ids = _.map(deletedData, 'id')
    //             await Promise.all(deletedData.map((data) => {
    //                 return this.saveAndCommitHistory(data, "delete")
    //             }))
    //             await this.tableClass.query(this.trx.trx).whereIn("id", ids).delete()
    //             return deletedData
    //         } else {
    //             throw this.createError400Pattern("object", "No records found based on your data")
    //         }
    //     })
    // }

    // async deleteById(id) {
    //     return this.tableClass.transaction(async trx => {
    //         const res = await this.query(trx).deleteById(id)
    //         if (res) {
    //             this.saveHistory({ id }, "delete", trx)
    //             return id
    //         } else {
    //             throw this.createError400Pattern("id", "This id was not found")
    //         }
    //     })
    // }

    /**
     * Принимает колбэк, все методы в нем будут выполнены в рамках одной транзакции
     * @param {() => any} fn 
     * @protected
     */
    async startTransaction(fn) {
        const res = await this.tableClass.transaction(async trx => {
            this.trx.trx = trx
            return await fn()
        })
        this.trx.trx = undefined
        return res
    }

    get() {
        return this.tableClass.query()
    }

    query() {
        return this.tableClass.query()
    }
}  