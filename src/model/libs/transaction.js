//@ts-check

"use srtict"

const Knex = require("knex")
const dbConfig = require("../../../serverConfig").db
const knex = Knex(dbConfig)

/**
 * @class
 * @classdesc Класс отвечающий за транзакции
 */
module.exports = class Transaction {
    /**
     * Стартует собственную транзакцию если trx не указан
     * @param {*} trx 
     * @param {function(any):any} fn 
     */
    static async startTransOpt(trx, fn) {
        if (trx) {
            return fn(trx)
        } else {
            return knex.transaction(fn)
        }
    }
}