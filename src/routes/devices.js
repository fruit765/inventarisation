//@ts-check

"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const History = require('../model/orm/history')
const Status = require('../model/orm/status')
const router = express.Router()
const fp = require("lodash/fp")
const Table = require('../model/facade/table')

router.route('/devices')
    .all((req, res, next) => {
        req.tableDevice = new Table(Device)
        sendP(next)(res)(tableDevice.getUnconfirm())
    })
    .get((req, res, next) => {
        sendP(next)(res)(tableDevice.getUnconfirm())
    })
    .post((req, res, next) => {
        sendP(next)(res)(tableDevice.patchAndFetch(req.body))
    })
    .patch(async (req, res, next) => {

        const virtualDevice = (await getDevWithVirtualStatus(req.body.id))[0]

        const getPrevStatus = async id => History
            .query()
            .where("device_id", id)
            .whereRaw(`JSON_EXTRACT(diff, '$.status_id') IS NOT NULL`)
            .orderBy('id', 'desc') 
            .limit(2)
            .then(his => fp.get("[1].diff.user_id", his))
            .then(userId => fp.isNil(userId) ? virtualDevice.user_id : userId)

        if (req.query.action === "bind") {
            req.body.status_id = await Status.getIdByStatus("given")
        } else if (req.query.action === "remove") {
            if (virtualDevice.status === "given") {  
                req.body.status_id = await Status.getIdByStatus("stock")
            } else if (virtualDevice.status === "givenIncomplete") {
                req.body.status_id = await Status.getIdByStatus("stock")
                //req.body.user_id = await getPrevStatus(req.body.id)
                //.whereRaw(`JSON_CONTAINS(history.description, '?', 'status')`, [req.body.id])
            } else if (virtualDevice.status === "return") {
                req.body.status_id = await Status.getIdByStatus("given")
                //req.body.user_id = await getPrevStatus(req.body.id)
            }
        }

        const updQuery = Device.query()
            .findById(req.body.id)
            .patch(fp.omit("id")(req.body))
            .then(() => getDevWithVirtualStatus(req.body.id))
            .then(dev => dev[0])

        sendP(next)(res)(updQuery)
    })

module.exports = router