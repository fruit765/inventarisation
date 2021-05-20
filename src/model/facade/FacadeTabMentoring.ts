import { Transaction } from 'knex'
import { FacadeTable } from "./facadeTable"
import _ from "lodash"

/**@classdesc Для таблиц связанных с категориями */

export default class FacadeTabMentoring extends FacadeTable {
    constructor(actorId: number, options?: { isSaveHistory?: boolean }) {
        super("mentoring", actorId, options)
    }
}