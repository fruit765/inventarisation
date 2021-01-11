"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Account = require('../model/orm/account')
const Table = require('../model/libs/table')
const table = new Table(Account)
const router = express.Router()

router.route('/accounts')
    .get((req, res, next) => {
        sendP(next)(res)(table.get())
    })
    .post( (req, res, next) => {
        sendP(next)(res)(table.setActorId(req.user.id).insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(table.setActorId(req.user.id).patchAndFetch(req.body))
    })

module.exports = router