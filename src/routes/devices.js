"use strict"

const express = require('express')
const { getTable, insertTable, updateTable, send, getWithVirtualStatus, sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const Status = require('../model/orm/status')
const router = express.Router()

router.route('/devices')
    .get((req, res, next) => {
        sendP(next)(res)(getWithVirtualStatus())
    })
    .post((req, res, next) => {
        send(next)(res)(insertTable(Device)(req.body))
    })
    .patch(async (req, res, next) => {
        let status
        switch (req.query.action) {
            case "bind":
                req.body.status_id = await Status.getIdByStatus("given")
                status = "givenIncomplete"
                break
            case "remove":
                req.body.status_id = await Status.getIdByStatus("stock")
                break
            //case "undo":

        }

        const updQuery = Device.query()
            .findById(req.body.id)
            .patch(fp.omit("id")(req.body))
            .then(fp.set("status", status))
            .then(() => req.body.specifications ? fp.set("specifications")(JSON.parse(req.body.specifications))(req.body) : req.body)

        sendP(next)(res)(updQuery)
    })

module.exports = router