import { Transaction } from 'knex';
import { NewRecHistory } from '../class/history/newRecHistory';
import { recValidate } from '../class/recValidate';
import { TabAction } from '../class/tabAction/tabAction';
import { hasHistory } from '../libs/bindHisTabInfo';
import { getUnconfirm } from '../libs/outputTab';
import { startTransOpt } from '../libs/transaction';

/**@classdesc Класс фасад, для работы с таблицами */
export class FacadeTable {
    private tableClass: any
    protected tableName: string
    private actorId: number
    private isSaveHistory?: boolean
    private initAttr?: Promise<boolean>

    constructor(tableClass: any, actorId: number, options: { isSaveHistory?: boolean }) {
        this.tableClass = tableClass
        this.tableName = tableClass.tableName
        this.actorId = actorId
        this.isSaveHistory = Boolean(options.isSaveHistory ?? true)
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
    protected async createTabAction(data: any, tableName: string, actionTag: string, trx: Transaction<any, any>) {
        await this.init()
        if (this.isSaveHistory) {
            const validDataId = await new recValidate(data, tableName, actionTag).validate()
            const validData = {...data, id: validDataId}
            const newRecHistory = await new NewRecHistory(validData, tableName, actionTag, this.actorId, trx).create()
            const recHistory = newRecHistory.get()
            await recHistory.genEvents()
            await recHistory.tryCommit()
            return new TabAction(validData, tableName, actionTag, trx)
        } else {
            return new TabAction(data, tableName, actionTag, trx)
        }
    }

    /**Добовляет данные в таблицу возвражает id записи */
    async insert(data: any, trxOpt?: Transaction<any, any>) {
        return startTransOpt(trxOpt, async trx => {
            const x = await this.createTabAction(data, this.tableName, "insert", trx)
            return x.applyAction()
        })
    }

    /**Обновляет данные в таблице возвражает id записи */
    async patch(data: any, trxOpt?: Transaction<any, any>) {
        return startTransOpt(trxOpt, async trx => {
            const x = await this.createTabAction(data, this.tableName, "patch", trx)
            return x.applyAction()
        })
    }

    /**Изменяет данные и возвращает объект с неподтвержденными данными */
    async patchAndFetch(data: any, trxOpt?: Transaction<any, any>) {
        const id = await this.patch(data, trxOpt)
        return (await this.getUnconfirm(id))[0]
    }

    /**Добовляет данные и возвращает объект с неподтвержденными данными */
    async insertAndFetch(data: any, trxOpt?: Transaction<any, any>) {
        const id = await this.insert(data, trxOpt)
        return (await this.getUnconfirm(id))[0]
    }

    /**Удаляет данные по id */
    async delete(id: number, trxOpt?: Transaction<any, any>) {
        return startTransOpt(trxOpt, async trx => {
            const x = await this.createTabAction({ id }, this.tableName, "delete", trx)
            return x.applyAction()
        })
    }

    /**Возвращает записи с неподтверденными данными */
    async getUnconfirm(id?: number) {
        return getUnconfirm(this.tableName, id)
    }
}