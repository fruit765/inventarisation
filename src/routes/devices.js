//@ts-check

"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const router = express.Router()
const Table = require('../model/facade/table')

router.route('/devices')
    .all((req, res, next) => {
        req.myObj = new Table(Device, {
            actorId: /**@type {*}*/ (req.user)?.id
        })
        next()
    })
    .get((req, res, next) => {
        sendP(next)(res)(req.myObj.getUnconfirm())
    })
    .post((req, res, next) => {
        sendP(next)(res)(req.myObj.insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(req.myObj.patchAndFetch(req.body))
    })

module.exports = router