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

    /**Создание плана*/
    async createPlan(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirm(data.id,trxOpt)
        if (currentMentoring[0]?.status != "noplan" && currentMentoring[0]?.status != "plancreated") {
            throw this.handleErr.statusMustBeNoplanOrPlancreated()
        }
        const planCreatedStatusId = await knex("status").where("status", "plancreated").first().then((x: { id: number }) => x.id)
        return super.patchAndFetch({...data, status_id: planCreatedStatusId}, trxOpt)
    }
}