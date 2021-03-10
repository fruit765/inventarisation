import { Transaction } from "knex"
import Knex from "knex"
import { db as dbConfig } from "../../../serverConfig"
import CreateErr from "./createErr"
import _ from "lodash"
import { delUndefinedDeep, stringifySubJSON } from "../libs/objectOp"

const knex = Knex(dbConfig)

/**@classdesc Класс внесения изменений в DB */
export default class TabAction {

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
        this.errHandler = new CreateErr()
        if (this.data.id == undefined && actionTag !== "insert") {
            throw this.errHandler.idEmpty()
        }
    }

    /**Обновляет поле в таблице */
    private async patch(): Promise<number> {
        const query = this.trx ? knex(this.tableName).transacting(this.trx) : knex(this.tableName)
        const rdyData = stringifySubJSON(this.data)
        let patchData = delUndefinedDeep(_.omit(rdyData, "id"))
        if (!_.isEmpty(patchData)) {
            const resPatch = await <Promise<number>>query.where({ id: rdyData.id }).update(patchData)
            if (!resPatch) {
                throw this.errHandler.idWrong()
            }
        }
        return <number>rdyData.id
    }

    /**Добовляет поле в таблицу */
    private async insert(): Promise<number> {
        const rdyData = stringifySubJSON(this.data)
        const query = this.trx ? knex(this.tableName).transacting(this.trx) : knex(this.tableName)
        const insRes = await <Promise<any>>query.insert(rdyData)
        return <number>insRes[0]
    }

    /**Удаляет поле из таблицы */
    private async delete(): Promise<number> {
        const query = this.trx ? knex(this.tableName).transacting(this.trx) : knex(this.tableName)
        const resDel = await <Promise<number>>query.where({ id: this.data.id }).del()
        if (!resDel) {
            throw this.errHandler.idWrong()
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