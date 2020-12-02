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
        req.body.date_purchase = dateToIso(req.body.date_purchase)
        req.body.date_warranty_end = dateToIso(req.body.date_warranty_end)
        req.body.specifications = JSON.stringify(req.body.specifications)
        req.body=mapKeys(req.body, (value, key) => {
            if (!key.includes("specifications_")) {
                return key
            }
        })
        delete(req.body[undefined])
        send(next)(res)(insertTable(Device)(req.body))
    })
    .patch((req, res, next) => {
        req.body.parent_id = req.body.parent_id ? req.body.parent_id : null
        req.body.date_purchase = dateToIso(req.body.date_purchase)
        req.body.date_warranty_end = dateToIso(req.body.date_warranty_end)
        req.body.specifications = JSON.stringify(req.body.specifications)
        req.body=mapKeys(req.body, (value, key) => {
            if (!key.includes("specifications_")) {
                return key
            }
        })
        delete(req.body[undefined])
        send(next)(res)(updateTable(Device)(req.body))
    })

module.exports = router