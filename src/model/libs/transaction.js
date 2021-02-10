const { modelPaths } = require("../orm/act");

//@ts-check

module.exports = class Transaction {
    constructor() {
        this.trx = undefined
        /**@type {Promise<any>} */
        this.queue = Promise.resolve()
    }

    async startTransaction(fn) {
        const res = this.trx.queue = this.trx.queue.then(
            () => this.tableClass.transaction(
                async trx => {
                    this.trx.trx = trx
                    const response = await fn()
                    this.trx.trx = undefined
                    return response
                }).catch(err => new Error(err))
        )
    }
}