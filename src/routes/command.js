"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const Post_dep_loc = require('../model/orm/post_dep_loc')

const Responsibility = require('../model/orm/responsibility')
const router = express.Router()

router.get('/warehouseResponsible', (req, res, next) => {
    const response = Responsibility.query().where("warehouseResponsible", 1).select("id")
    sendP(next)(res)(response)
})

router.post('/subDevices', async (req, res, next) => {
    await Device.query().where("parent_id",req.body.id).patch({"parent_id":null})
    await Device.query().findByIds(req.body.ids).patch({parent_id:req.body.id})
    const response = Device.query().findByIds(req.body.ids)
    sendP(next)(res)(response)
})

router.get('/post_dep_loc', async (req, res, next) => {
    let response

    if (req.query.status === "free") {
        response = Post_dep_loc.query().where("free", ">", 0)
    } else if (req.query.status === "all") {
        response = Post_dep_loc.query()
    }

    sendP(next)(res)(response)
})

module.exports = router