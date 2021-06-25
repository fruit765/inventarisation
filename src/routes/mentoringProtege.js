"use strict"

const express = require('express')
const FacadeTabMentoring  = require('../model/facade/FacadeTabMentoring').default
const { sendP } = require('../model/libs/command')
const router = express.Router()

router.route('/mentoringProtege')
    .all((req, res, next) => {
        req.myObj = new FacadeTabMentoring(req.user.id)
        next()
    })
    .patch(async (req, res, next) => {
        sendP(next)(res)(req.myObj.patchConfirmPlan(req.body))
    })

module.exports = router