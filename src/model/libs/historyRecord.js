// //@ts-check
// /**
//  *  @typedef { import("objection") } Objection
//  */
// "use strict"

// const Knex = require("knex")
// const dbConfig = require("../../../serverConfig").db
// const History = require("../orm/history")
// const Transaction = require("./transaction")
// const ApplyAction = require("./applyAction")
// const { addedDiff, updatedDiff } = require("deep-object-diff")
// const Events = require("../libs/events")
// const knex = Knex(dbConfig)
// const _ = require("lodash")

// module.exports = class historyRecord {
//     constructor(table, data) {
//         this.hisRec = data.hisRec
//         this.actionTag = this.hisRec.action_tag ?? data.actionTag
//         this.id = this.hisRec[table+"_id"] ?? data.new.id
//         this.actorId = this.hisRec.actor_id ?? data.actorId
//         this.new = data.new
//         this.actual = data.actual ?? {}
//         this.table = table
//         this.actionTag = data.actionTag
      
//     }

//     getId() {
//         return this.id
//     }

//     packDiff() {

//     }

//     unpackDiff() {

//     }

//     generate() {
//         if()
//         let dataCopy = this.actionTag === "delete" ? { id: this.id } : _.cloneDeep(this.new)
//         const actualData = this.actual
//         const modData = this.packDiff(actualData, dataCopy)
//         const historyInsertData = {
//             actor_id: this.actorId,
//             diff: JSON.stringify(modData),
//             action_tag: this.actionTag,
//             [this.table+"_id"]: this.id
//         }
//         this.hisRec = historyInsertData
//         return this
//     }

//     saveToDb(trx) {
//         return History.query(trx).insert(this.hisRec)
//     }

//     tryCommit() {

//     }

//     validate() {

//     }
// }