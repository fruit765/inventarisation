import { hasHistory } from "./bindHisTabInfo"
import _ from "lodash"
import { delUndefined } from "./objectOp"
import Status from "../orm/status"
import knex from "../orm/knexConf"

/**Получает только новые незакоммиченные данные из таблицы*/
async function getUnconfirmOnly(tabName: string, id?: number) {
    if (!await hasHistory(tabName)) {
        return []
    }
    let eventMaxPriorSingle: any[] = []
    const hisColName = hasHistory(tabName + "_id") ? tabName + "_id" : null
    if (hisColName) {

        knex.raw("select * from device").then(x => console.log(x[0]))

        const myEvents = 
        `
        select * from event_confirm where date_completed is null
        `
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
                    .select(hisColName, "view_priority", "status_id", "diff")
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
    const unconfirmIndex = _.keyBy(unconfirm, tabName + "_id")
    for (let key in tableDataIndex) {
        if (unconfirmIndex[key]) {
            if (priority < unconfirmIndex[key].view_priority) {
                Object.assign(tableDataIndex[key], unconfirmIndex[key].diff)
            }
            tableDataIndex[key].status_id = unconfirmIndex[key].status_id
        }
        if (tableDataIndex[key].status_id != null) {
            tableDataIndex[key].status = statusIndex[tableDataIndex[key].status_id]?.status
            tableDataIndex[key].status_rus = statusIndex[tableDataIndex[key].status_id]?.status_rus
        }

    }
    const tableDataEdit = _.values(tableDataIndex)
    return tableDataEdit
}

export { getUnconfirm }