import { Transaction } from "knex";
import { interfaces } from "../../../../interfaces";

/**@classdesc базовый класс декораторов */
export class applyActionDecorator implements interfaces.tabAction {
    protected component: interfaces.tabAction

    constructor(component: interfaces.tabAction) {
        this.component = component
    }

    async applyAction(): Promise<number> {
        return this.component.applyAction()
    }

    getTableName(): string {
        return this.component.getTableName()
    }

    getData(): any {
        return this.component.getData()
    }

    getActionTag(): string {
        return this.component.getActionTag()
    }

    getTrx(): Transaction<any, any> {
        return this.component.getTrx()
    }

    setData(data: any) {
        this.component.setData(data)
    }

    setTrx(trx: Transaction<any, any>): void {
        this.component.setTrx(trx)
    }
}