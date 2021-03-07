import { Transaction } from 'knex';
import { TabAction } from '../class/tabAction/tabAction';
import { hasHistory } from '../libs/bindHisTabInfo';

/**@classdesc Класс фасад, для работы с таблицами */
export class FacadeTable {
    private tableClass: any
    private tableName: string
    private actorId: number
    private isSaveHistory?: boolean

    constructor(tableClass: any, actorId: number, options: { isSaveHistory?: boolean }) {
        this.tableClass = tableClass
        this.tableName = tableClass.tableName
        this.actorId = actorId
        this.isSaveHistory = Boolean(options.isSaveHistory ?? true)
    }

    async init() {
        this.isSaveHistory = await hasHistory(this.tableName) && this.isSaveHistory
    }

    protected createTabAction(data: any, tableName: string, actionTag: string, trx: Transaction<any, any>) {
        if (this.isSaveHistory) {
            
        } else {
            return new TabAction(data, tableName, actionTag, trx)
        }
    }

    insert(data: any) {
        
    }

    patch(data: any) {

    }

    patchAndFetch(data: any) {

    }

    insertAndFetch(data: any) {

    }

    delete(id: number) {

    }
}