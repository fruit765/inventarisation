import { Transaction } from "knex";

export namespace interfaces {
    export interface tabAction {
        applyAction: () => Promise<number>
        getTableName: () => string
        getData: () => any
        getActionTag: () => string
        getTrx: () => Transaction<any, any>
        setData: (data: any) => void
        setTrx: (trx: Transaction<any, any>) => void
    }
}
