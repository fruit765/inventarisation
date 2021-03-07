import { Transaction } from "knex";
import { TabAction } from "./tabAction";

/**@classdesc Фабрика applyAction */
export class TabActFab {
    private type?: string

    constructor(type?: string) {
        this.type = type
    }

    /**Возвращает экземпляр класса tabAction */
    createAct(data: any, tableName: string, actionTag: string, trx: Transaction<any, any>) {
        switch (this.type) {
            case "default":
            case undefined:
                return new TabAction(data, tableName, actionTag, trx)
            case "saveHis"
        }
        // if (this.type === "default" || this.type == undefined) {
        //     return new TabAction(data, tableName, actionTag, trx)
        // } else if
    }
}