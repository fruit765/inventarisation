"use strict"

const express = require('express')
const { getTable, insertTable, updateTable, send, dateToIso, sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const Status = require('../model/orm/status')
const router = express.Router()

router.route('/devices')
    .get((req, res, next) => {
        //const virtualStock = Device.query().joinRelated()

        sendP(next)(res)(Device.query().joinRelated("status").select("device.*","status.status"))
    })
    .post((req, res, next) => {
        send(next)(res)(insertTable(Device)(req.body))
    })
    .patch(async (req, res, next) => {
        switch (req.query.action) {
            case "bind":
                req.body.status = await Status.getIdByStatus("given")
                break
            case "remove":
                req.body.status = await Status.getIdByStatus("stock")
                break
            //case "undo":

        }

        send(next)(res)(updateTable(Device)(req.body))
    })

module.exports = router