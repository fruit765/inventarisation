"use strict"

const express = require('express')
const { insertTable, updateTable, send, sendP } = require('../model/libs/command')
const User = require('../model/orm/user')
const router = express.Router()

router.route('/users')
    .get(async (req, res, next) => {
        sendP(next)(res)(User.query())
    })
    .post( (req, res, next) => {
        sendP(next)(res)(User.query().insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        send(next)(res)(updateTable(User)(req.body))
    })

module.exports = router