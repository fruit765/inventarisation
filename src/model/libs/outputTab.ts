import { hasHistory } from "./bindHisTabInfo"
import Knex from "knex"
import { db as dbConfig } from "../../../serverConfig"
import _ from "lodash"
import { delUndefined } from "./objectOp"
import Status from "../orm/status"

const knex = Knex(dbConfig)

/**Получает только новые незакоммиченные данные из таблицы*/
async function getUnconfirmOnly(tabName: string, id?: number) {
    let eventMaxPriorSingle: any[] = []
    const hisColName = hasHistory(tabName + "_id") ? tabName + "_id" : null
    if (hisColName) {
        const myEvents = knex("event_confirm")
            .whereNull("date_completed")
            .where(delUndefined({ [hisColName]: id, table: tabName }))
            .innerJoin("history", "history.id", "event_confirm.history_id")
            .innerJoin("event_confirm_preset", "event_confirm_preset.id", "event_confirm.event_confirm_preset_id")

        const groupMaxPriority = myEvents
            .clone()
            .select(hisColName)
            .max("view_priority as max_view_priority")
            .groupBy(hisColName)


        const eventsMaxPriority = knex
            .queryBuilder()
            .from(function (this: any) {
                const t1 = myEvents
                    .select("device_id", "view_priority", "status_id", "diff")
                    .as("t1")
                Object.assign(this, t1)
            })
            .innerJoin(
                function () {
                    const t0 = groupMaxPriority.as("t0")
                    Object.assign(this, t0)
                },
                function () {
                    this.on("t0." + hisColName, "t1." + hisColName).andOn("t0.max_view_priority", "t1.view_priority")
                }
            )
        eventMaxPriorSingle = await <Promise<any[]>>eventsMaxPriority.select("t1.*").groupBy("t1." + hisColName)
    }

    return eventMaxPriorSingle
}

/**Получает данные из таблицы с новой еще не закомиченной информацией*/
async function getUnconfirm(tabName: string, id?: number) {
    const priority = -0.1
    const unconfirm = await getUnconfirmOnly(tabName, id)
    const tableQuery = knex(tabName)
    const tableData = await <Promise<any[]>>tableQuery.where(delUndefined({ id }))
    const status = await Status.query()
    const statusIndex = _.keyBy(status, "id")
    const tableDataIndex = _.keyBy(tableData, "id")
    for (let value of unconfirm) {
        if (tableDataIndex[value.device_id]) {
            tableDataIndex[value.device_id].status_id = value.status_id
            if (priority < value.view_priority) {
                Object.assign(tableDataIndex[value.device_id], value.diff)
            }
        }
    }
    const tableDataEdit = _.values(tableDataIndex)
    for (let value of tableDataEdit) {
        if (value.status_id != null) {
            value.status = statusIndex[value.status_id]?.status
            value.status_rus = statusIndex[value.status_id]?.status_rus
        }
    }

    return tableDataEdit
}

export { getUnconfirm }