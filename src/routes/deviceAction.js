"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const History = require('../model/orm/history')
const Status = require('../model/orm/status')
const router = express.Router()
const fp = require("lodash/fp")
const Table = require('../model/libs/table')
const table = new Table(Device)

router.route('/deviceAction')
    .all((req, res, next) => {
        table.setActorId(req.user.id)
        next()
    })
    .post(async (req, res, next) => {
        if (req.query.action === "bind") {
            const data = req.body
            data.status_id = await Status.query().where("status", "given").first()
            const response = table.patchAndFetch(data)
            sendP(next)(res)(response)
        } else if (req.query.action === "remove") {
            
        }
        send(next)(res)(insertTable(Device)(req.body))
    })

module.exports = router