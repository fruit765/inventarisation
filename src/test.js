// // const History = require("./model/orm/history");

const Device = require("./model/orm/device");

// // History.query().then(x => {console.log(x.prototype)})
// //     /**
// //      * @typedef {Object} eventRec 
// //      * @property {number} history_id
// //      * @property {number} event_confirm_preset_id
// //      * @property {*} confirm
// //      * @property {string} status
// //      * @property {string=} date_completed
// //      * @property {string} date
// //      * @property {number} actor_id
// //      * @property {number} table_id
// //      * @property {*} diff
// //      * @property {string} action_tag
// //      * @property {*} preset
// //      * @property {number} view_priotiry
// //      * @property {string} start_preset_date
// //      * @property {string=} end_preset_date
// //      * @property {*} confirm_need
// //      * @property {string} table
// //      * @property {number} status_id
// //      * @property {string} table_status
// //      * @property {string} table_status_rus
// //      * @property {string} preset_name
// //      * @property {string} preset_name_rus
// //      * 
// //      * @param {eventRec} eventRec аккуратно конструктор мутирует этот объект
// //      */
// "use strict"

// const Knex = require("knex")
// const dbConfig = require("../serverConfig").db
// const knex = Knex(dbConfig)
// const _ = require("lodash")
// const { Model } = require("objection")
// const Device = require("./model/orm/device")
// const Event_confirm = require("./model/orm/event_confirm")

// // Device.query().from(function () {
// //     Object.assign(this, Device.query().innerJoin(
// //         function () {
// //             Object.assign(this, Device.query().max("price as maxPrice").select("category_id").groupBy("category_id").as("d0"))
// //         },
// //         function () {
// //             this.on("d0.category_id", "device.category_id").andOn("d0.maxPrice", "device.price")
// //         }
// //     ).as("d1"))
// // }).groupBy("category_id").then(console.log)

// // Device.query().innerJoin(
// //     function () {
// //         Object.assign(this, Device.query().max("price as maxPrice").select("category_id").groupBy("category_id").as("d0"))
// //     },
// //     function () {
// //         this.on("d0.category_id", "device.category_id").andOn("d0.maxPrice", "device.price")
// //     }
// // ).as("d1").then(console.log)

// //Device.query().max("price").select("category_id").groupBy("category_id").then(console.log)
// const tableCol = "device_id"
// const tableName = "device"


// // const myEvents = Event_confirm
// //     .query()
// //     .whereNull("date_completed")
// //     .where("table", tableName)
// //     .joinRelated(`[history,event_confirm_preset]`)

// const myEvents = knex("event_confirm")
//     .whereNull("date_completed")
//     .where("table", tableName)
//     .where(_.omitBy({[tableCol]: undefined, table: this.tableName}, _.isUndefined))
//     .innerJoin("history", "history.id", "event_confirm.history_id")
//     .innerJoin("event_confirm_preset", "event_confirm_preset.id", "event_confirm.event_confirm_preset_id")

// const groupMaxPriority = myEvents
//     .clone()
//     .select(tableCol)
//     .max("view_priority as max_view_priority")
//     .groupBy(tableCol)


// const eventsMaxPriority = knex
//     .queryBuilder()
//     .from(function () {
//         Object.assign(this, myEvents.innerJoin("status", "status.id", "event_confirm_preset.status_id").select("device_id", "view_priority", "status_id", "diff", "status.status", "status_rus").as("t1"))
//     })
//     .innerJoin(
//         function () {
//             Object.assign(this, groupMaxPriority.as("t0"))
//         },
//         function () {
//             this.on("t0." + tableCol, "t1." + tableCol).andOn("t0.max_view_priority", "t1.view_priority")
//         }
//     )

// const eventMaxPriorSingle = eventsMaxPriority.select("t1.*","ddd").groupBy("t1." + tableCol)

// // const deviceWithUnconf = knex(tableName).select("*.status_id as sssss","*", knex.raw(`CASE WHEN t3.status_id THEN t3.status_id ELSE ${tableName}.status_id END as status_id`),).leftJoin(
// //     function () {
// //         Object.assign(this, eventMaxPriorSingle.clone().as("t3"))
// //     },
// //     "id",
// //     "device_id"
// // )

// // const deviceWithUnconfStatus = knex("status").innerJoin(
// //     function () {
// //         Object.assign(this, deviceWithUnconf.as("t4"))
// //     },
// //     "status.id",
// //     "t4.status_id"
// // ).select("t4.*","status.status","status.status_rus")

// eventMaxPriorSingle.then(console.log)

Device.query().then(x => {console.log(typeof x[0].id)})