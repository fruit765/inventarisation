
"use strict"
//         //if (!valid) console.log(validate.errors)

const dayjs = require("dayjs")
const Knex = require("knex")
const dbConfig = require("../serverConfig").db;

const knex = Knex(dbConfig)
// try{
//     knex.schema.hasColumn("devi1ce1", "id3").then(console.log).catch(x => console.log(x.errno))
// } catch(err){
//     console.log(err)
// }
console.log(dayjs().toISOString())
console.log(new Date().toISOString())
//knex("device").then(console.log)
var d;

console.log(new Date().toString());

process.env.TZ = 'America/Los_Angeles';

d = new Date('2012-1-12 02:00 PM');
console.log(new Date().toString());

process.env.TZ = "America/New_York";
d = new Date('2012-1-12 02:00 PM');
console.log(new Date().toString());

process.env.TZ = 'America/Los_Angeles';

d = new Date('2012-1-12 02:00 PM');
console.log(new Date().toString());

process.env.TZ = 'America/Chicago';

d = new Date('2012-1-12 02:00 PM');
console.log(new Date().toString());

process.env.TZ = 'Hongkong';

d = new Date('2012-1-12 02:00 PM');
console.log(new Date().toString());

process.env.TZ = "America/New_York";
d = new Date('2012-1-12 02:00 PM');
console.log(new Date().toString());
