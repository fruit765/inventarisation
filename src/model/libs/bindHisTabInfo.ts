import Knex from "knex"
import {db as dbConfig} from "../../../serverConfig"
import History from "../orm/history"

const knex = Knex(dbConfig)

/**Получаем ид связанной таблицы из записи истории*/
function getTabIdFromHis(hisRec: any): number | undefined {
    for (let key in hisRec) {
        if (String(key).match(/_id$/gi) && key !== "actor_id" && hisRec[key] != null) {
            return hisRec[key]
        }
    }
}

/**Получаем название связанной таблицы из записи истории */
function getTabNameFromHis(hisRec: any) {
    for (let key in hisRec) {
        if (String(key).match(/_id$/gi) && key !== "actor_id" && hisRec[key] != null) {
            return key.slice(0, -3)
        }
    }
}

/**Проверяет сохраняется ли история у данной таблицы*/
async function hasHistory(tableName: string) {
    return knex.schema.hasColumn(History.tableName, tableName+"_id")
}

export { getTabIdFromHis, getTabNameFromHis, hasHistory }