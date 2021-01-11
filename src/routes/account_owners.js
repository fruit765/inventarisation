"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Table = require('../model/libs/table')
const Account_owner = require('../model/orm/account_owner')
const table = new Table(Account_owner)
const router = express.Router()

router.route('/account_owner')
    .get((req, res, next) => {
        sendP(next)(res)(table.get())
    })
    .post( (req, res, next) => {
        sendP(next)(res)(table.setActorId(req.user.id).insertAndFetch(req.body))
    })
    .delete((req, res, next) => {
        sendP(next)(res)(table.setActorId(req.user.id).delete(req.body.id))
    })

module.exports = router