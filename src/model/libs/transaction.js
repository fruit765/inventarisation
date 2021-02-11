const { modelPaths } = require("../orm/act");

//@ts-check

module.exports = class Transaction {
    constructor() {
        this.trx = undefined
        /**
         * @type {Promise<any>} 
         * @private
        */
        this.queue = Promise.resolve()
        /**
         * @type {Promise<any>} 
         * @private
        */
        this.queueRollback = Promise.resolve()
    }

    async startTransaction(fn) {
        const resP = this.queue = this.queue.then(
            () => this.tableClass.transaction(
                async trx => {
                    const trxOld = this.trx
                    this.trx = trx
                    const response = await fn()
                    this.trx = trxOld
                    return response
                }).catch(err => [new Error("err"), err])
        )

        const res = await resP

        if (typeof res === "object" && res[0] instanceof Error && res[0].message === "err") {
            throw res[1]
        }

        return res
    }

    async startTransRollback (fn) {
        const resP = this.queue = this.queue.then(
            () => this.tableClass.transaction(
                async trx => {
                    const trxOld = this.trx
                    this.trx = trx
                    const response = await fn()
                    this.trx = trxOld
                    return response
                }).catch(err => [new Error("err"), err])
        )

        const res = await resP

        if (typeof res === "object" && res[0] instanceof Error && res[0].message === "err") {
            throw res[1]
        }

        return res
    }
}