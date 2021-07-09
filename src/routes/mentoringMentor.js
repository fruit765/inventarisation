"use strict"

const express = require('express')
const FacadeTabMentoring  = require('../model/facade/FacadeTabMentoring').default
const { sendP } = require('../model/libs/command')
const router = express.Router()

router.route('/mentoringMentor')
    .all((req, res, next) => {
        req.myObj = new FacadeTabMentoring(req.user.id)
        next()
    })
    .post(async (req, res, next) => {
        sendP(next)(res)(req.myObj.patchConfirmPlan(req.body))
    })
    .patch(async (req, res, next) => {
        sendP(next)(res)(req.myObj.setCompleteStatus(req.body))
    })

module.exports = router