"use strict"

const express = require('express')
const FacadeTabMentoring  = require('../model/facade/FacadeTabMentoring').default
const { sendP } = require('../model/libs/command')
const router = express.Router()

router.route('/mentoring')
    .all((req, res, next) => {
        req.myObj = new FacadeTabMentoring(req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        sendP(next)(res)(req.myObj.getUnconfirm())
    })
    .post((req, res, next) => {
        sendP(next)(res)(req.myObj.insertAndFetch(req.body))
    })
    .patch(async (req, res, next) => {
        sendP(next)(res)(req.myObj.createPlan(req.body))
    })
    .put((req, res, next) => {
        sendP(next)(res)(req.myObj.acceptPlan(req.body))
    })

module.exports = router