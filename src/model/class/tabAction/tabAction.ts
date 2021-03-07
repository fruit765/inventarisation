import { Transaction } from "knex"
import Knex from "knex"
import { db as dbConfig } from "../../../../serverConfig"
import { CreateErr } from "../createErr"
import _ from "lodash"
import { interfaces } from "../../../interfaces"

const knex = Knex(dbConfig)

/**@classdesc Класс внесения изменений в DB */
export class TabAction implements interfaces.tabAction{

    private tableName: string
    private data: any
    private actionTag: string
    private trx: Transaction<any, any>
    private errHandler: CreateErr

    constructor(data: any, tableName: string, actionTag: string, trx: Transaction<any, any>) {
        this.tableName = tableName
        this.data = data
        this.actionTag = actionTag
        this.trx = trx
        this.errHandler = this.setErrorHandler()
        if (this.data.id == undefined && actionTag !== "insert") {
            throw new CreateErr().idEmpty()
        }
    }

    getTableName(): string {
        return this.tableName
    }

    getData(): any {
        return this.data
    }

    getActionTag (): string {
        return this.actionTag
    }

    getTrx(): Transaction<any, any> {
        return this.trx
    }

    setData(data: any): void {
        this.data = data
    }

    setTrx(trx: Transaction<any, any>): void {
        this.trx = trx
    }

    /**Устанавливает класс обработчик ошибок */
    private setErrorHandler() {
        return new CreateErr()
    }

    /**Применяет JSON.stringify ко всем вложенным объектам*/
    private stringifyColJSON(data: any) {
        const fillteredData: any = {}
        for (let key in data) {
            if (typeof data[key] === "object") {
                fillteredData[key] = JSON.stringify(data[key])
            } else {
                fillteredData[key] = data[key]
            }
        }
        return fillteredData
    }

    /**Обновляет поле в таблице */
    private async patch() {
        const query = this.trx ? knex(this.tableName).transacting(this.trx) : knex(this.tableName)
        const rdyData = this.stringifyColJSON(this.data)
        let patchData = _.omit(rdyData, "id")
        if (!_.isEmpty(patchData)) {
            const resPatch = await <Promise<number>>query.where({ id: rdyData.id }).update(patchData)
            if (!resPatch) {
                throw new CreateErr().idWrong()
            }
        }
        return <number>rdyData.id
    }

    /**Добовляет поле в таблицу */
    private async insert() {
        const rdyData = this.stringifyColJSON(this.data)
        const query = this.trx ? knex(this.tableName).transacting(this.trx) : knex(this.tableName)
        const insRes = await <Promise<any>>query.insert(rdyData)
        return <number>insRes.id
    }

    /**Удаляет поле из таблицы */
    private async delete() {
        const query = this.trx ? knex(this.tableName).transacting(this.trx) : knex(this.tableName)
        const resDel = await <Promise<number>>query.where({ id: this.data.id }).del()
        if (!resDel) {
            throw new CreateErr().idWrong()
        }
        return <number>this.data.id
    }

    /**Применяет действие к таблице, используя указанные данные*/
    async applyAction(): Promise<number> {
        switch (this.actionTag) {
            case "insert":
                return this.insert()
            case "patch":
                return this.patch()
            case "delete":
                return this.delete()
            default:
                throw this.errHandler.internalServerError()
        }
    }
}