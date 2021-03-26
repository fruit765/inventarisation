
"use strict"
//         //if (!valid) console.log(validate.errors)

// const dayjs = require("dayjs")
// const Knex = require("knex")
// const dbConfig = require("../serverConfig").db;
const User = require("../src/model/orm/user")

// const knex = Knex(dbConfig)
// try{
//     knex.schema.hasColumn("devi1ce1", "id3").then(console.log).catch(x => console.log(x.errno))
// } catch(err){
//     console.log(err)
// }
const a = User
    .query()
    .findById(1)
    .joinRelated("role")
    .select("user.*", "role")
    .then(console.log)