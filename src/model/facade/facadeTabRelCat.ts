import { getTabClassByName } from "../libs/queryHelper"
import { FacadeTable } from "./facadeTable"

/**@classdesc Для таблиц связанных с категориями */

export default class FacadeTabRelCat extends FacadeTable {

    async getByCatId(catId: number) {
        return getTabClassByName(this.tableName)
            .query()
            .joinRelated("device")
            .where("category_id", catId)
            .select(this.tableName + ".*")
    }
}