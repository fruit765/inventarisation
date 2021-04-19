import _ from "lodash"
import knex from "../orm/knexConf"
import { FacadeTable } from "./facadeTable"

/**@classdesc Для таблицы software category */

export default class FacadeTabSoftwareCat extends FacadeTable {

    constructor(actorId: number, options?: { isSaveHistory?: boolean }) {
        super("software_category", actorId, options)
    }

    async getUnconfWithType(catId: number) {
        const unconfirm = await this.getUnconfirm()
        const type = await <Promise<any[]>>knex("software_cat_type")
        const typeIndex = _.keyBy(type, "id")
        return unconfirm.map(val => {
            val.software_cat_type = typeIndex?.[val.software_cat_type_id]?.name
            return val
        })
    }
}