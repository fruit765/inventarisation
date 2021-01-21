"use strict"

const express = require('express')
const { getTable, insertTable, updateTable, send, getDevWithVirtualStatus, sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const History = require('../model/orm/history')
const Status = require('../model/orm/status')
const router = express.Router()
const fp = require("lodash/fp")
const Table = require('../model/libs/table')
const tableDevice = new Table(Device)

router.route('/devices')
    .get((req, res, next) => {
        tableDevice.getMap(value => {
            
        })

        sendP(next)(res)(getDevWithVirtualStatus())
    })
    .post((req, res, next) => {
        send(next)(res)(insertTable(Device)(req.body))
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