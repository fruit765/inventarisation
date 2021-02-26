// const History = require("./model/orm/history");

// History.query().then(x => {console.log(x.prototype)})
//     /**
//      * @typedef {Object} eventRec 
//      * @property {number} history_id
//      * @property {number} event_confirm_preset_id
//      * @property {*} confirm
//      * @property {string} status
//      * @property {string=} date_completed
//      * @property {string} date
//      * @property {number} actor_id
//      * @property {number} table_id
//      * @property {*} diff
//      * @property {string} action_tag
//      * @property {*} preset
//      * @property {number} view_priotiry
//      * @property {string} start_preset_date
//      * @property {string=} end_preset_date
//      * @property {*} confirm_need
//      * @property {string} table
//      * @property {number} status_id
//      * @property {string} table_status
//      * @property {string} table_status_rus
//      * @property {string} preset_name
//      * @property {string} preset_name_rus
//      * 
//      * @param {eventRec} eventRec аккуратно конструктор мутирует этот объект
//      */
"use strict"

const Knex = require("knex")
const dbConfig = require("../serverConfig").db
const knex = Knex(dbConfig)

const Device = require("./model/orm/device")
const Event_confirm = require("./model/orm/event_confirm")

Device.query().from(function () {
    Object.assign(this, Device.query().innerJoin(
        function () {
            Object.assign(this, Device.query().max("price as maxPrice").select("category_id").groupBy("category_id").as("d0"))
        },
        function () {
            this.on("d0.category_id", "device.category_id").andOn("d0.maxPrice", "device.price")
        }
    ).as("d1"))
}).groupBy("category_id").then(console.log)

// Device.query().innerJoin(
//     function () {
//         Object.assign(this, Device.query().max("price as maxPrice").select("category_id").groupBy("category_id").as("d0"))
//     },
//     function () {
//         this.on("d0.category_id", "device.category_id").andOn("d0.maxPrice", "device.price")
//     }
// ).as("d1").then(console.log)

//Device.query().max("price").select("category_id").groupBy("category_id").then(console.log)