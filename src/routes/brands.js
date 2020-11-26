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
const Brand = require('../model/orm/brand')
const router = express.Router()

router.route('/brands')
    .get((req, res, next) => {
        const response = req.query.catId ?
            getDevRelatedTabValueAssociatedCatId(Brand)(req.query.catId) :
            getTable(Brand)

        send(next)(res)(response)
    })
    .post((req, res, next) => {
        send(next)(res)(insertTable(Brand)(req.body))
    })
    .patch((req, res, next) => {
        send(next)(res)(updateTable(Brand)(req.body))
    })
    .delete((req, res, next) => {
        send(next)(res)(deleteTable(Brand)(req.body.id))
    })

module.exports = router