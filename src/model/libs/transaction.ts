import Knex, { Transaction } from "knex"
import { db as dbConfig } from "../../../serverConfig"

const knex = Knex(dbConfig)

/**Стартует собственную транзакцию если trx не указан*/
async function startTransOpt(trx: Transaction<any, any>, fn: (trx: Transaction<any, any>) => any ) {
    if (trx) {
        return fn(trx)
    } else {
        return knex.transaction(fn)
    }
}

export { startTransOpt }