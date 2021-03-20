import CreateErr  from './../createErr'
import { getTabIdFromHis, getTabNameFromHis } from "../../libs/bindHisTabInfo"
import { Transaction } from 'knex'
import { startTransOpt } from '../../libs/transaction'
import Event_confirm from '../../orm/event_confirm'
import History from '../../orm/history'
import dayjs from 'dayjs'
import { unpack } from '../../libs/packDiff'
import Knex from "knex"
import { db as dbConfig } from "../../../../serverConfig"
import TabAction from '../tabAction'
import _ from 'lodash'
import { GetPresets } from '../preset/GetPresets'

const knex = Knex(dbConfig)

/**
 * Класс существующей записи в истории
 * @class
 */

export class RecHistory {
    private hisRec: any
    private id: number
    private tableName: string
    private tableId: number
    private actionTag: string
    private handleErr: CreateErr
    private trx: Transaction<any, any> | undefined
    private actualData: any

    constructor(hisRec: any, trxOpt?: Transaction<any, any>) {
        this.hisRec = hisRec
        this.id = hisRec.id
        this.handleErr = new CreateErr()
        const tableName = getTabNameFromHis(hisRec)
        if (!tableName) {
            throw this.handleErr.internalServerError()
        }
        this.tableName = tableName
        const tableId = getTabIdFromHis(hisRec)
        if (tableId == undefined) {
            throw this.handleErr.internalServerError()
        }
        this.tableId = tableId
        this.actionTag = hisRec.action_tag
        this.trx = trxOpt
        this.actualData = {}
    }

    /**Записывает в this текущую информацию с таблици свзанной с этой записью в истории*/
    private async refreshActualData() {
        const query = this.trx ? knex(this.tableName).transacting(this.trx) : knex(this.tableName)
        this.actualData = await <Promise<any>>query.where("id", this.tableId).first()
    }

    /**Если актуальные данные записанны в this возвращает их если нет то делает запрос в БД*/
    private async getActualDataCache() {
        if (_.isEmpty(this.actualData)) {
            await this.refreshActualData()
        }
        return this.actualData
    }

    /**Записывает данные в историю если все события связанные с этой записью подтверждены, либо их нет*/
    async tryCommit(): Promise<boolean> {
        if (this.hisRec.commit_date != null) {
            return false
        }
        return startTransOpt(this.trx, async trx => {
            const openEvents = await Event_confirm.query(trx).where("history_id", this.id).whereNotNull("date_completed")
            if (!openEvents.length) {
                const curretDataTime = dayjs().toISOString()
                await History.query(trx).where("id", this.id).whereNull("commit_date").patch(<any>{ commit_date: curretDataTime })
                const id = this.hisRec[this.tableName + "_id"]
                const diff = await unpack(this.hisRec.diff, () => {
                    return this.getActualDataCache()
                })
                await new TabAction({ ...diff, id: id }, this.tableName, this.actionTag, trx).applyAction()
                this.hisRec.commit_date = curretDataTime
                return true
            } else {
                return false
            }
        })
    }

    /**Генерирует события для данной записи в истории*/
    async genEvents() {
        const getPresets = new GetPresets()
        const actualPresets = await getPresets.getActualPresets()
        for (let element of actualPresets) {
            await element.genEventsByHisRec(this.hisRec, await this.getActualDataCache(), this.trx)
        }
    }
}