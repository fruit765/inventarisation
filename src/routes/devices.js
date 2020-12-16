"use strict"

const express = require('express')
const { getTable, insertTable, updateTable, send, getDevWithVirtualStatus, sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const History = require('../model/orm/history')
const Status = require('../model/orm/status')
const router = express.Router()

router.route('/devices')
    .get((req, res, next) => {
        sendP(next)(res)(getDevWithVirtualStatus())
    })
    .post((req, res, next) => {
        send(next)(res)(insertTable(Device)(req.body))
    })
    .patch(async (req, res, next) => {
        const device = await Device
            .query()
            .findById(req.body.id)
            .joinRelated("status")
            .select("device.*", "status")

        const virtualDevice = (await getDevWithVirtualStatus(req.body.id))[0]

        if (req.query.action === "bind") {
            req.body.status_id = await Status.getIdByStatus("given")
        } else if (req.query.action === "remove") {
            if (virtualDevice.status === "given" && virtualDevice.status === "givenIncomplete") {
                req.body.status_id = await Status.getIdByStatus("stock")
            } else {
                req.body.status_id = await Status.getIdByStatus("given")
                //req.body.user_id = await History.query().where("device_id", req.body.id)
            }
        }

        const updQuery = Device.query()
            .findById(req.body.id)
            .patch(fp.omit("id")(req.body))
            .then(dev => getDevWithVirtualStatus(dev.id))
            .then(dev => dev[0])
        //.then(fp.set("status", status))
        //.then(() => req.body.specifications ? fp.set("specifications")(JSON.parse(req.body.specifications))(req.body) : req.body)

        sendP(next)(res)(updQuery)
    })

module.exports = router