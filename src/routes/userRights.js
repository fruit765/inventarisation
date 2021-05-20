"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const { default: knex } = require('../model/orm/knexConf')

const router = express.Router()

router.get('/userRights', async (req, res, next) => {
    let userRights = knex("responsibility")
        .whereNotNull("user_id")
        .select("user_id as id", "warehouseResponsible", "leader")

    let postDepLocRights = knex("responsibility")
        .whereNotNull("responsibility.post_dep_loc_id")
        .join("post_dep_loc", "post_dep_loc.id", "=", "responsibility.post_dep_loc_id")
        .join("user", "user.post_dep_loc_id", "=", "post_dep_loc.id")
        .select("user.id as id", "responsibility.warehouseResponsible", "leader")

    if (req.query.id) {
        userRights = userRights.whereIn("user_id", [req.query.id])
        postDepLocRights = postDepLocRights.whereIn("user.id", [req.query.id])
    }
    const rights = (await userRights).concat(await postDepLocRights)
    sendP(next)(res)(rights)
})

module.exports = router