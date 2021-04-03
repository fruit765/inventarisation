
"use strict"
//         //if (!valid) console.log(validate.errors)

// const dayjs = require("dayjs")
// const Knex = require("knex")
// const dbConfig = require("../serverConfig").db;
const User = require("../src/model/orm/user")
const { default: knex } = require("./model/orm/knexConf")

// const knex = Knex(dbConfig)
// try{
//     knex.schema.hasColumn("devi1ce1", "id3").then(console.log).catch(x => console.log(x.errno))
// } catch(err){
//     console.log(err)
// }
knex.raw("select * from device").then(x => console.log(x[0]))