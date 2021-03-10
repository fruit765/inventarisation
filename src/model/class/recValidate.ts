import { Model } from 'objection';
import TabAction from './tabAction';

export class recValidate {
    private tableName: string
    private data: any
    private actionTag: string
    private id: number

    constructor(data: any, tableName: string, actionTag: string) {
        this.tableName = tableName
        this.data = data
        this.id = data.id
        this.actionTag = actionTag
    }

    async validate() {
        const trx = await Model.startTransaction()
        const response = await new TabAction(this.data, this.tableName, this.actionTag, trx)
            .applyAction()
            .then(
                async (res) => {
                    await <Promise<any>>trx.rollback()
                    return res
                },
                async err => {
                    await <Promise<any>>trx.rollback()
                    return Promise.reject(err)
                })
        this.id = response
        return this
    }

    getId() {
        return this.id
    }
}
