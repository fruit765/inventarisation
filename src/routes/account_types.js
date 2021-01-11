"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Table = require('../model/libs/table')
const Account_type = require('../model/orm/account_type')
const table = new Table(Account_type)
const router = express.Router()

router.route('/account_types')
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