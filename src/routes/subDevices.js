"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')

const router = express.Router()

router.post('/subDevices', async (req, res, next) => {
    await Device.query().where("parent_id", req.body.id).patch({ "parent_id": null })
    await Device.query().findByIds(req.body.ids).patch({ parent_id: req.body.id })
    const response = Device.query().findByIds(req.body.ids)
    sendP(next)(res)(response)
})

module.exports = router