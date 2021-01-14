"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const Employer = require('../model/orm/employer')

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

router.get('/employers', async (req, res, next) => {
    sendP(next)(res)(Employer.query())
})



module.exports = router