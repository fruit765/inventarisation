"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Table = require('../model/facade/table')
const Account_type = require('../model/orm/account_type')
const table = new Table(Account_type)
const router = express.Router()

router.route('/account_types')
    .all((req, res, next) =>{
        table.setActorId(req.user.id)
        next()
    })
    .get((req, res, next) => {
        sendP(next)(res)(table.getAll())
    })
    .post( (req, res, next) => {
        sendP(next)(res)(table.insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(table.patchAndFetch(req.body))
    })

module.exports = router