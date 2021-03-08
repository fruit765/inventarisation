"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Account = require('../model/orm/account')
const Table = require('../model/facade/facadeTable').FacadeTable
const table = new Table(Account)
const router = express.Router()

router.route('/accounts')
    .all((req, res, next) => {
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