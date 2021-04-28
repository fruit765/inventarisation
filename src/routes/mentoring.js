"use strict"

const express = require('express')
const { FacadeTable } = require('../model/facade/facadeTable')
const { sendP } = require('../model/libs/command')
const router = express.Router()

router.route('/mentoring')
    .all((req, res, next) => {
        this.myObj = new FacadeTable("mentoring", req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        sendP(next)(res)(this.myObj.getUnconfirm())
    })
    .post((req, res, next) => {
        sendP(next)(res)(this.myObj.insertAndFetch(req.body))
    })

module.exports = router