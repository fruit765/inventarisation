"use strict"

const FacadeTabSoftware = require('../model/facade/facadeTabSoftware').default
const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()

router.route('/softwares')
    .all((req, res, next) => {
        req.myObj = new FacadeTabSoftware(req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        const response = req.myObj.getUnconfirm()
        sendP(next)(res)(response)
    })
    .post((req, res, next) => {
        sendP(next)(res)(req.myObj.insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(req.myObj.patchAndFetch(req.body))
    })

module.exports = router