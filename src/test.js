
"use strict"
//         //if (!valid) console.log(validate.errors)

// const dayjs = require("dayjs")
// const Knex = require("knex")
// const dbConfig = require("../serverConfig").db;

const { default: knex } = require("./model/orm/knexConf")

// const knex = Knex(dbConfig)
// try{
//     knex.schema.hasColumn("devi1ce1", "id3").then(console.log).catch(x => console.log(x.errno))
// } catch(err){
//     console.log(err)
// }
const x = async () => {
    try {
        await knex("software_owner")
        .insert({ device_id: 1, software_id: 1 })
        .then(x => console.log(x))
    } catch (err) {
        console.log(err)
    }
    
    // await knex("software_owner")
    //     .insert({ device_id: 1, software_id: 1 })
    //     .onConflict()
    //     .ignore().then(x => console.log(x))
}
x()
//knex("device").whereIn("id", []).then(x => console.log(x[0]))