"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')

const router = express.Router()

router.post('/subDevices', async (req, res, next) => {
    const bindDev = await Device.query().findByIds(req.body.ids)
    const parentDev = await Device.query().findById(req.body.id)
    await Device.query().findByIds(req.body.ids).patch(
        {
            parent_id: parentDev.id,
            user_id: parentDev.user_id,
            status_id: parentDev.status_id
        })
    //await Device.query().findByIds(req.body.ids).patch({ parent_id: req.body.id })
    const response = Device.query().findByIds(req.body.ids)
    sendP(next)(res)(response)
})

module.exports = router