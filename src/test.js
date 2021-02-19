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

let a = {
    a: 3,
    fn: function () { return this }
}

console.log(a.fn())