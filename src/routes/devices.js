"use strict"

const express = require('express')
const {  mapKeys } = require('lodash')
const { getTable, insertTable, updateTable, send, dateToIso } = require('../model/libs/command')
const Device = require('../model/orm/device')
const router = express.Router()

router.route('/devices')
    .get((req, res, next) => {
        send(next)(res)(getTable(Device))
    })
    .post( (req, res, next) => {
        send(next)(res)(insertTable(Device)(req.body))
    })
    .patch((req, res, next) => {
        send(next)(res)(updateTable(Device)(req.body))
    })

module.exports = router