//@ts-check
/**
 * @typedef { import("objection") } Objection
 */

const Events = require("./events")
const GlobalHistory = require("./globalHistory")
const _ = require("lodash")

/**
 * @class
 * @classdesc Предназначен для получения данных из таблиц
 */
module.exports = class GetDataTab {
    /**
     * @param {Objection["Model"]} tableClass 
     * @param {Options} [options]
     * 
     * @typedef {Object} Options
     * @property {number} priority
     */
    constructor(tableClass, options) {
        /**
         * @private
         * @readonly
         */
        this.tableClass = tableClass
        /**@private*/
        this.hasHistory = GlobalHistory.hasHistory(this.tableClass.tableName)
    }

    /**
     * Получает текущие данные из таблицы
     */
    async getAll() {
        return this.tableClass.query()
    }

    /**
     * Получает текущие данные из таблицы по ID
     * @param {number} id
     */
    async getById(id) {
        return this.tableClass.query().findById(id)
    }

    /**
     * Получает данные из таблицы с новой еще не закомиченной информацией
     * @param {number=} id
     */
    async getUnconfirm(id) {
        let unconfSnapshot = []
        if (await this.hasHistory) {
            unconfSnapshot = await Events.getUnconfirmSnapshot(this.tableClass.tableName ,id)
        }
        const tableData = await this.tableClass.query().skipUndefined().where("id", /**@type {*}*/(id))
        return tableData.concat(_.pullAllBy(tableData, unconfSnapshot, "id"))
    }
}