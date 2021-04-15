"use strict"

const FacadeTabSoftware = require('../model/facade/FacadeTabSoftware').default
const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()

router.route('/softwares')
    .all((req, res, next) => {
        this.myObj = new FacadeTabSoftware(req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        const response = this.myObj.getUnconfirm()
        sendP(next)(res)(response)
    })
    .post((req, res, next) => {
        sendP(next)(res)(this.myObj.insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(this.myObj.patchAndFetch(req.body))
    })

module.exports = router