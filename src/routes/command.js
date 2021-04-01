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

module.exports = router