"use strict"

const express = require('express')
const { getTable, insertTable, updateTable, send } = require('../model/libs/command')
const Account = require('../model/orm/account')
const router = express.Router()

router.route('/accounts')
    .get((req, res, next) => {
        send(next)(res)(getTable(Account))
    })
    .post( (req, res, next) => {
        send(next)(res)(insertTable(Account)(req.body))
    })
    .patch((req, res, next) => {
        send(next)(res)(updateTable(Account)(req.body))
    })

module.exports = router