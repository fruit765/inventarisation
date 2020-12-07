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
    await Device.query().where("parent_id", req.body.id).patch({ "parent_id": null })
    await Device.query().findByIds(req.body.ids).patch({ parent_id: req.body.id })
    const response = Device.query().findByIds(req.body.ids)
    sendP(next)(res)(response)
})

router.get('/post_dep_loc', async (req, res, next) => {
    let response = Post_dep_loc
        .query()
        .joinRelated("[post, dep_loc.[department, location]]")
        .select("post_dep_loc.id", "post", "department", "location")

    if (req.query.status === "free") {
        response = response.where("free", ">", 0)
    }

    sendP(next)(res)(response)
})

module.exports = router