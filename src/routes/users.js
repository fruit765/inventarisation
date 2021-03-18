"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const FacadeTable = require('../model/facade/facadeTable').FacadeTable

router.route('/users')
    .all((req, res, next) => {
        req.myObj = new FacadeTable("User", (req.user)?.id)
        next()
    })
    .get((req, res, next) => {
        sendP(next)(res)(req.myObj.getUnconfirm())
    })
    .post((req, res, next) => {
        sendP(next)(res)(req.myObj.insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(req.myObj.patchAndFetch(req.body))
    })

module.exports = router