//@ts-check
/**
 * @typedef { import("objection") } Objection
 */
"use strict"

const ApplyAction = require("../libs/applyAction")
const GlobalHistory = require("../libs/globalHistory")

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)
const _ = require("lodash")
const Status = require("../orm/status")
const Transaction = require("../libs/transaction")

/**
 * @class
 * @classdesc Класс фасад, для работы с таблицами
 */
module.exports = class FacadeTable {
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
         * @protected
         * @type {Promise<boolean>}
         */
        this.isSaveHistory = Promise.resolve(false)
        /**
         * @protected
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
        /**@protected*/
        this.history = undefined
        /**@protected */
        this.applyActionClass = new ApplyAction(tableClass)
        /**@private */
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
    * Исполняет указанное действие с сохранением в историю
    * Возвращает id измененной записи
    * @param {*} data 
    * @param {*} actionTag 
    * @param {*} [trxOpt]
    * @protected
    */
    async applyActionSaveHis(data, actionTag, trxOpt) {
        return Transaction.startTransOpt(trxOpt, async trx => {
            if (await this.isSaveHistory && this.history && this.hisColName) {
                const validId = await this.applyActionClass.validate(data, actionTag)
                const validData = Object.assign({}, data, { id: validId })
                const saveHis = await this.history.saveAndApply(validData, actionTag, trx)
                return saveHis[this.hisColName]
            }
        })
    }

    /**
     * Исполняет указанное действие без сохранения в историю
     * Возвращает id измененной записи
     * @param {*} data 
     * @param {*} actionTag 
     * @param {*} [trxOpt]
     * @protected
     */
    async applyActionNoSaveHis(data, actionTag, trxOpt) {
        return Transaction.startTransOpt(trxOpt, trx => {
            return this.applyActionClass.applyAction(data, actionTag, trx)
        })
    }

    /**
     * Исполняет указанное действие
     * Возвращает id измененной записи
     * @param {*} data 
     * @param {*} actionTag 
     * @param {*} [trxOpt]
     * @private
     */
    async applyAction(data, actionTag, trxOpt) {
        return Transaction.startTransOpt(trxOpt, async trx => {
            let id
            if (await this.isSaveHistory && this.history && this.hisColName) {
                id = this.applyActionSaveHis(data, actionTag, trx)
            } else {
                id = this.applyActionNoSaveHis(data, actionTag, trx)
            }
            return id
        })
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
        const id = await this.insert(data)
        return this.getUnconfirm(id)
    }

    /**
     * Изменяет данные и возвращает объект с неподтвержденными данными
     * @param {{id: number, [key: string] : any}} data 
     */
    async patchAndFetch(data) {
        await this.patch(data)
        return this.getUnconfirm(data.id)
    }

    /**
     * Получает данные из таблицы с новой еще не закомиченной информацией
     * @param {number=} id
     */
    async getUnconfirm(id) {
        /**@type {*[]} */
        let eventMaxPriorSingle = []
        const priority = -0.1
        const hisColName = this.hisColName
        if (this.hisColName && GlobalHistory.hasHistory(this.hisColName)) {
            const myEvents = knex("event_confirm")
                .whereNull("date_completed")
                .where(_.omitBy({ [/**@type {string}*/(hisColName)]: id, table: this.tableName }, _.isUndefined))
                .innerJoin("history", "history.id", "event_confirm.history_id")
                .innerJoin("event_confirm_preset", "event_confirm_preset.id", "event_confirm.event_confirm_preset_id")

            const groupMaxPriority = myEvents
                .clone()
                .select(/**@type {string}*/(hisColName))
                .max("view_priority as max_view_priority")
                .groupBy(/**@type {string}*/(hisColName))


            const eventsMaxPriority = knex
                .queryBuilder()
                .from(/**@this {*}*/function () {
                    const t1 = myEvents
                        .select("device_id", "view_priority", "status_id", "diff")
                        .as("t1")
                    Object.assign(this, t1)
                })
                .innerJoin(
                    /**@this {*}*/
                    function () {
                        const t0 = groupMaxPriority.as("t0")
                        Object.assign(this, t0)
                    },
                    /**@this {*}*/
                    function () {
                        this.on("t0." + hisColName, "t1." + hisColName).andOn("t0.max_view_priority", "t1.view_priority")
                    }
                )
            eventMaxPriorSingle = await eventsMaxPriority.select("t1.*").groupBy("t1." + hisColName)
        }
        /**@type {*} */
        const tableQuery = this.tableClass.query()
        /**@type {*[]} */
        const tableData = await tableQuery.skipUndefined().where("id", id)
        const status = await Status.query()
        const statusIndex = _.keyBy(status, "id")
        const tableDataIndex = _.keyBy(tableData, "id")
        for (let value of eventMaxPriorSingle) {
            if (tableDataIndex[value.device_id]) {
                tableDataIndex[value.device_id].status_id = value.status_id
                if (priority < value.view_priority) {
                    Object.assign(tableDataIndex[value.device_id], value.diff)
                }
            }
        }
        const tableDataEdit = _.values(tableDataIndex)
        for (let value of tableDataEdit) {
            if (value.status_id != null) {
                value.status = statusIndex[value.status_id]?.status
                value.status_rus = statusIndex[value.status_id]?.status_rus
            }
        }

        return tableDataEdit
    }

    getAll() {
        return this.tableClass.query()
    }
}