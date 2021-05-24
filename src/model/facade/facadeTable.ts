import { Transaction } from 'knex'
import { NewRecHistory } from '../class/history/newRecHistory'
import RecValidate from '../class/recValidate'
import TabAction from '../class/tabAction'
import { hasHistory } from '../libs/bindHisTabInfo'
import { delUndefined } from '../libs/objectOp'
import { getUnconfirm } from '../libs/outputTab'
import { startTransOpt } from '../libs/transaction'
import knex from '../orm/knexConf'
import CreateErr from './../class/createErr'

/**@classdesc Класс фасад, для работы с таблицами */
export class FacadeTable {
    protected tableName: string
    private actorId: number
    private isSaveHistory?: boolean
    private initAttr?: Promise<boolean>
    protected handleErr: CreateErr

    constructor(tableName: string, actorId: number, options?: { isSaveHistory?: boolean }) {
        this.handleErr = new CreateErr()
        if (typeof tableName !== "string") {
            throw this.handleErr.internalServerError("tableName is not a string")
        }

        this.tableName = tableName.toLowerCase()
        this.actorId = actorId
        this.isSaveHistory = Boolean(options?.isSaveHistory ?? true)
        this.initAttr = undefined
        this.init()
    }

    /**Инициализация гарантирует что стартовые ассинхронные процесы закончены 
     * Если история не сохраняется то не имеет смысла
    */
    async init() {
        if (!this.initAttr) {
            this.isSaveHistory = await hasHistory(this.tableName) && this.isSaveHistory
            return this.initAttr = Promise.resolve(true)
        } else {
            return this.initAttr
        }
    }

    /**Создает класс записи в таблицу, перед этим проводит необходимые действия */
    protected async applyAction(data: any, tableName: string, actionTag: string, trx: Transaction<any, any>) {
        await this.init()
        if (this.isSaveHistory) {
            const validDataId = (<any>await new RecValidate(data, tableName, actionTag).validate()).id
            const validData = { ...data, id: validDataId }
            const newRecHistory = await new NewRecHistory(validData, tableName, actionTag, this.actorId, trx).create()
            const recHistory = newRecHistory.get()
            await recHistory?.genEvents()
            await recHistory?.tryCommit()
            return validDataId
        } else {
            return new TabAction(data, tableName, actionTag, trx).applyAction()
        }
    }

    /**Добовляет данные в таблицу возвражает id записи */
    async insert(data: any, trxOpt?: Transaction<any, any>) {
        return startTransOpt(trxOpt, async trx => {
            return this.applyAction(data, this.tableName, "insert", trx)
        })
    }

    /**Обновляет данные в таблице возвражает id записи */
    async patch(data: any, trxOpt?: Transaction<any, any>) {
        return startTransOpt(trxOpt, async trx => {
            return await this.applyAction(data, this.tableName, "patch", trx)
        })
    }

    /**Изменяет данные и возвращает объект с неподтвержденными данными */
    async patchAndFetch(data: any, trxOpt?: Transaction<any, any>) {
        const id = await this.patch(data, trxOpt)
        return (await this.getUnconfirm(id, trxOpt))[0]
    }

    /**Добовляет данные и возвращает объект с неподтвержденными данными */
    async insertAndFetch(data: any, trxOpt?: Transaction<any, any>) {
        const id = await this.insert(data, trxOpt)
        return (await this.getUnconfirm(id, trxOpt))[0]
    }

    /**Удаляет данные по id */
    async delete(id: number, trxOpt?: Transaction<any, any>) {
        return startTransOpt(trxOpt, async trx => {
            return await this.applyAction({ id }, this.tableName, "delete", trx)
        })
    }

    /**Возвращает записи с неподтверденными данными */
    async getUnconfirm(id?: number | number[], trxOpt?: Transaction<any, any>) {
        return getUnconfirm(this.tableName, {id, trxOpt})
    }

    /**Просто получить таблицу */
    async get(id?: number) {
        return knex(this.tableName).where(delUndefined({ id }))
    }
}