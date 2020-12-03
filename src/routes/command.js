"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')

const Responsibility = require('../model/orm/responsibility')
const router = express.Router()

router.get('/warehouseResponsible', (req, res, next) => {
    const response = Responsibility.query().where("warehouseResponsible", 1).select("id")
    sendP(next)(res)(response)
})

router.post('/subDevices', async (req, res, next) => {
    await Device.query().where("parent_id",req.body.id).patch({"parent_id":null})
    const response = Device.query().findByIds(req.body.ids).patchAndFetch({parent_id:req.body.id})
    sendP(next)(res)(response)
})

module.exports = router