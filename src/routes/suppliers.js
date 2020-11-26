"use strict"

const express = require('express')
const {
    getTable,
    insertTable,
    updateTable,
    send,
    deleteTable,
    getDevRelatedTabValueAssociatedCatId
} = require('../model/libs/command')
const Supplier = require('../model/orm/supplier')
const router = express.Router()

router.route('/suppliers')
    .get((req, res, next) => {
        const response = req.query.catId ?
            getDevRelatedTabValueAssociatedCatId(Supplier)(req.query.catId) :
            getTable(Supplier)

        send(next)(res)(response)
    })
    .post((req, res, next) => {
        send(next)(res)(insertTable(Supplier)(req.body))
    })
    .patch((req, res, next) => {
        send(next)(res)(updateTable(Supplier)(req.body))
    })
    .delete((req, res, next) => {
        send(next)(res)(deleteTable(Supplier)(req.body.id))
    })

module.exports = router