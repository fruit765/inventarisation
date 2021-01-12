"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Table = require('../model/libs/table')
const Account_owner = require('../model/orm/account_owner')
const table = new Table(Account_owner)
const router = express.Router()

router.route('/account_owner')
    .all((req, res, next) => {
        table.setActorId(req.user.id)
        next()
    })
    .get((req, res, next) => {
        sendP(next)(res)(table.query()
            .skipUndefined()
            .where({ user_id: req.query.userId, dep_loc_id: req.query.depLocId, account_id: req.query.accountId })
        )
    })
    .post((req, res, next) => {
        sendP(next)(res)(table.insertAndFetch(req.body))
    })
    .delete((req, res, next) => {
        sendP(next)(res)(table.delete(req.body.id))
    })

module.exports = router