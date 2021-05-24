"use strict"

const express = require('express')
const FacadeTabMentoring  = require('../model/facade/FacadeTabMentoring').default
const { sendP } = require('../model/libs/command')
const router = express.Router()

router.route('/mentoring')
    .all((req, res, next) => {
        this.myObj = new FacadeTabMentoring(req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        sendP(next)(res)(this.myObj.getUnconfirm())
    })
    .post((req, res, next) => {
        sendP(next)(res)(this.myObj.insertAndFetch(req.body))
    })
    .patch(async (req, res, next) => {
        sendP(next)(res)(this.myObj.createPlan(req.body))
    })

module.exports = router