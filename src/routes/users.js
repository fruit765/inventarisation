"use strict"

const express = require('express')
const { getTable, insertTable, updateTable, send } = require('../model/libs/command')
const User = require('../model/orm/user')
const router = express.Router()

router.route('/users')
    .get((req, res, next) => {
        send(next)(res)(getTable(User))
    })
    .post( (req, res, next) => {
        send(next)(res)(insertTable(User)(req.body))
    })
    .patch((req, res, next) => {
        send(next)(res)(updateTable(User)(req.body))
    })

module.exports = router