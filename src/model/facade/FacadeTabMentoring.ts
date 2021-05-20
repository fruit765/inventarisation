import { Transaction } from 'knex'
import { FacadeTable } from "./facadeTable"
import _ from "lodash"

/**@classdesc Для таблиц связанных с категориями */

export default class FacadeTabMentoring extends FacadeTable {

    /**Добовляет данные в таблицу возвражает id записи */
    async insert(data: any, trxOpt?: Transaction<any, any>) {
        return super.insert(data, trxOpt)
    }

}