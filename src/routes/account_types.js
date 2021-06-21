"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Table = require('../model/facade/facadeTable').FacadeTable
const router = express.Router()

router.route('/account_types')
    .all((req, res, next) =>{
        req.myObj = new Table("Account_type", req.user.id)
        next()
    })
    .get((req, res, next) => {
        sendP(next)(res)(req.myObj.getUnconfirm())
    })
    .post( (req, res, next) => {
        sendP(next)(res)(req.myObj.insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(req.myObj.patchAndFetch(req.body))
    })

module.exports = router