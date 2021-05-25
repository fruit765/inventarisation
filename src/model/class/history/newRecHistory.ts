import CreateErr from './../createErr'
import { Transaction } from 'knex'
import Knex from "knex"
import { db as dbConfig } from "../../../../serverConfig"
import { pack } from "../../libs/packDiff"
import History from '../../orm/history'
import { RecHistory } from './recHistory'

const knex = Knex(dbConfig)

/**
 * Класс новой записи в истории.
 * @class
 */
export class NewRecHistory {
    private data: any
    private tableName: string
    private errHandler: CreateErr
    private tableId: number
    private trx: Transaction<any, any>
    private actorId: number
    private actionTag: string
    private inserted: any

    constructor(data: any, tableName: string, actionTag: string, actorId: number, trx: Transaction<any, any>) {
        this.errHandler = new CreateErr()
        this.data = actionTag === "delete" ? { id: data.id } : { ...data }
        this.tableName = tableName
        this.trx = trx
        if (!actorId) {
            throw this.errHandler.internalServerError("actor_id empty")
        }
        this.actorId = actorId
        if (!data.id) {
            throw this.errHandler.idEmpty()
        }
        this.tableId = data.id
        this.actionTag = actionTag
    }

    /**Записывает в базу данные из этого класса, создает запись в истории*/
    async create() {
        const actualData = await <Promise<any>>knex(this.tableName).where("id", this.tableId).first() ?? {}
        const modData = pack(this.data, actualData)
        if (!Object.keys(modData).length) {
            this.inserted = null
            return this
        }

        const historyInsertData = {
            actor_id: this.actorId,
            diff: JSON.stringify(modData),
            action_tag: this.actionTag,
            [this.tableName + "_id"]: this.tableId
        }

        const hisRec = await History.query(this.trx).insert(<any>historyInsertData)
        this.inserted = Object.assign(hisRec, { diff: modData })
        return this
    }

    /**Возвращает экземпляр созданной записи в истории*/
    get() {
        if (!this.inserted) {
            return null
        }
        return new RecHistory(this.inserted, this.trx)
    }
}