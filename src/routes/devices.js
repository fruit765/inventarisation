"use strict"

const express = require('express')
const { getTable, insertTable, updateTable, send, dateToIso, sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const Status = require('../model/orm/status')
const router = express.Router()

router.route('/devices')
    .get((req, res, next) => {
        sendP(next)(res)(Device.getWithVirtualStatus())
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

        await Device.query()
            .findById(req.body.id)
            .patch(fp.omit("id")(req.body))
            .then(() => req.body.specifications ? fp.set("specifications")(JSON.parse(req.body.specifications))(req.body) : req.body)

        sendP(next)(res)(Device.getWithVirtualStatus())
    })

module.exports = router