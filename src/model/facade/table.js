//@ts-check
/**
 * @typedef { import("objection") } Objection
 */
"use strict"

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)
const _ = require("lodash")

const History = require("../orm/history")
const Events = require("../libs/events")
const ApplyAction = require("../libs/applyAction")
const GlobalHistory = require("../libs/globalHistory")
const GetDataTab = require("../libs/getDataTab")

/**
 * @class
 * @classdesc Класс фасад, для работы с таблицами
 */
module.exports = class Table {
    /**
     * @typedef {Object} tableOptions
     * @property {boolean} [isSaveHistory]
     * @property {number} [actorId]
     * @param {Objection["Model"]} tableClass 
     * @param { tableOptions } [options]
     */
    constructor(tableClass, options) {
        options = options ?? {}
        options.isSaveHistory = options.isSaveHistory ?? true
        /**
         * @private 
         * @type {{actorId?: number}}
         */
        this.options = {}
        /**
         * @private
         * @type {Promise<boolean>}
         */
        this.isSaveHistory = Promise.resolve(false)
        /**
         * @private
         * @type {string=}
         */
        this.hisColName = undefined
        /**
         * @private 
         * @readonly
         */
        this.tableClass = tableClass
        /**
        * @private
        * @readonly
        */
        this.tableName = this.tableClass.tableName
        /**@private*/
        this.history = undefined
        /**@private */
        this.applyActionClass = new ApplyAction(tableClass)
        /**@private */
        this.getDataTab = new GetDataTab(tableClass)
        this.setOpt(options)
    }

    /**
     * Для инициализации классов только в том случае если история сохраняется
     * @private
     */
    initHistoyClasses() {
        if (!this.history && this.options.actorId) {
            this.history = new GlobalHistory(this.tableClass, { actorId: this.options.actorId })
        }
    }

    /**
     * @param {tableOptions} options 
     */
    setOpt(options) {
        this.setActorId(options.actorId)
        this.setSaveHistory(options.isSaveHistory)
        return this
    }

    /**
     * @param {number|undefined} actorId 
     */
    setActorId(actorId) {
        if (actorId) {
            this.options.actorId = actorId
        }
        return this
    }

    /**
     * @param {boolean|undefined} isSaveHistory 
     */
    setSaveHistory(isSaveHistory) {
        if (isSaveHistory != undefined) {
            if (isSaveHistory && this.options.actorId) {
                this.hisColName = this.tableName + "_id"
                this.isSaveHistory = GlobalHistory.hasHistory(this.hisColName)
                    .then(x => {
                        if (x) {
                            this.initHistoyClasses()
                        }
                        return x
                    })
            } else {
                this.isSaveHistory = Promise.resolve(false)
            }
        }
    }

    /**
     * Исполняет указанное действие
     * Возвращает id измененной записи
     * @param {*} data 
     * @param {*} actionTag 
     * @private
     */
    async applyAction(data, actionTag) {
        let id
        if (await this.isSaveHistory && this.history && this.hisColName) {
            const saveHis = await this.history.saveAndApply(data, actionTag)
            id = saveHis[this.hisColName]
        } else {
            id = await this.applyActionClass.applyAction(data, actionTag)
        }
        return id
    }

    /**
     * Удаляет данные из таблицы по id
     * @param {number} id 
     */
    async deleteById(id) {
        return this.applyAction({ id }, "delete")
    }

    /**
     * Обновляет данные в таблице возвражает id записи
     * @param {{id: number, [key: string] : any}} data 
     * @returns {Promise<number>}
     */
    async patch(data) {
        return this.applyAction(data, "patch")
    }

    /**
     * Добовляет данные в таблицу возвражает id записи
     * @param {*} data 
     * @returns {Promise<number>}
     */
    async insert(data) {
        return this.applyAction(data, "insert")
    }

    /**
     * Добовляет данные и возвращает объект с неподтвержденными данными
     * @param {*} data 
     */
    async insertAndFetch(data) {
        const id = await this.patch(data)
        return this.getDataTab.getUnconfirm(id)
    }

    /**
     * Изменяет данные и возвращает объект с неподтвержденными данными
     * @param {{id: number, [key: string] : any}} data 
     */
    async patchAndFetch(data) {
        const id = await this.patch(data)
        return this.getDataTab.getUnconfirm(id)
    }

    getUnconfirm() {
        return this.getDataTab.getUnconfirm()
    }

    getAll() {
        return this.getDataTab.getAll()
    }
}