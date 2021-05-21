import { Transaction } from 'knex'
import { FacadeTable } from "./facadeTable"
import _ from "lodash"
import knex from '../orm/knexConf'

/**@classdesc Для таблиц связанных с категориями */

export default class FacadeTabMentoring extends FacadeTable {
    constructor(actorId: number, options?: { isSaveHistory?: boolean }) {
        super("mentoring", actorId, options)
    }

    /**Добовляет данные в таблицу возвражает id записи */
    async insert(data: any, trxOpt?: Transaction<any, any>) {
        const noplanStatusId = await knex("status").where("status", "noplan").first().then((x: { id: number }) => x.id)
        return super.insert({...data, status_id: noplanStatusId, plan: null}, trxOpt)
    }
}