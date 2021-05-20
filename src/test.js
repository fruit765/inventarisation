
"use strict"
//         //if (!valid) console.log(validate.errors)

// const dayjs = require("dayjs")
// const Knex = require("knex")
// const dbConfig = require("../serverConfig").db;
const Knex = require("knex")
const conf = require("../serverConfig")
const knex = Knex(conf.db)

knex("responsibility")
    .whereNotNull("responsibility.post_dep_loc_id")
    .join("post_dep_loc", "post_dep_loc.id", "=", "responsibility.post_dep_loc_id")
    .join("user", "user.post_dep_loc_id", "=", "post_dep_loc.id")
    .select("user.id as id","responsibility.warehouseResponsible", "leader")
    .then(console.log)