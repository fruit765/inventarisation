// @ts-check
/**
 * @typedef { import("objection") } Objection
 * @typedef { import("../../types/index").tableOptions } tableOptions
 */

"use strict"

const _ = require("lodash")

module.exports = class ApplyAction {
    /**
     * @param {@param {Objection["Model"]} tableClass } tableClass 
     */
    constructor(tableClass) {
        /**@private */
        this.tableClass = tableClass
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
     * Проверяет будут ли ошибки при вставке в БД, ничего не меняет в таблице
     * возвращает id объекта, при вставке генерируется id
     * @param {*} data 
     * @param {string} actionTag 
     */
    async validate(data, actionTag) {
        const trx = await this.tableClass.startTransaction()
        const response = this.applyAction(data, actionTag, trx).then(
            async (res) => {
                await trx.rollback()
                return res
            },
            async err => {
                await trx.rollback()
                return Promise.reject(err)
            })
        return response
    }


    /**
     * Просто применяет действие к таблице, используя указанные данные
     * никакие проверки и модификация данных не производится
     * @param {*} data
     * @param {string} actionTag 
     * @param {*} trx 
     */
    async applyAction(data, actionTag, trx) {
        /**@type {number} */
        let id = data.id
        const rdyData = this.stringifyColJSON(data)
        switch (actionTag) {
            case "delete":
                const delRes = await this.tableClass.query(trx).deleteById(rdyData.id)
                id = delRes === 0 ? null : id
                break
            case "insert":
                /**@type {{id: number, [key: string]: any}} */
                const resIns = /** @type {any} */ (await this.tableClass.query(trx).insert(rdyData))
                id = resIns.id
                break
            case "patch":
                const resPatch = await this.tableClass.query(trx).findById(id).patch(_.omit(rdyData, "id"))
                id = resPatch === 0 ? null : id
                break
        }

        return id
    }


}