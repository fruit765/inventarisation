"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const FacadeTabSoftwareCat = require('../model/facade/facadeTabSoftwareCat').default

router.route('/softwareCategory')
    .all((req, res, next) => {
        req.myObj = new FacadeTabSoftwareCat(req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        const response = req.myObj.getUnconfWithType()
        sendP(next)(res)(response)
    })

module.exports = router