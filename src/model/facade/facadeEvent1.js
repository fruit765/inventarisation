//@ts-check
// "use strict"

// const Events = require("../libs/events")

// /**
//  * @class
//  * @classdesc Фасад для событий
//  */
// module.exports = class FacadeEvent {
//     /**
//      * @param {number} actorId 
//      */
//     constructor(actorId) {
//         this.actorId = actorId
//     }

//     getEvents() {
//         const eventsArray = await Events.getEvents(this.actorId)
//         eventsArray.map((val, key)=> {
//             val.get()
//         })
//         /**@type {*[]} */
//         const res = []
//         const events = await Event_confirm.query().joinRelated("[events_confirm_preset,history]")
//         events.forEach((/**@type {*}*/event) => {
//             res.push({
//                 history_id: event.history_id,
//                 event_confirm_preset_id: event.event_confirm_preset_id,
//                 // confirm_need: need_confirm,
//                 // confirm: confirm_tmp,
//                 // confirm_reject: confirm_tmp,
//                 status: event.status,
//                 table: event.table,
//                 table_id: event[event.table + "_id"],
//                 name: event.name,
//                 name_rus: event.name_rus,
//                 actor_id: event.actor_id,
//                 // personal_ids: personal_ids,
//                 // additional: { device_user_id: eventHistory.diff.user_id },
//                 date: event.date,
//                 date_completed: event.date_completed
//             })
//         })

//         return res
//     }
// }

// getEventsPersonal() {
//     return
// }

// eventAccept() {

// }

// eventReject() {

// }

// eventBindAct() {

// }

// eventVeto() {

// }


// } 