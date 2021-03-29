"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const FacadeTableUser = require('../model/facade/facadeTableUser').default
const _ = require("lodash")

router.route('/users')
    .all((req, res, next) => {
        req.myObj = new FacadeTableUser((req.user)?.id)
        next()
    })
    .get((req, res, next) => {
        sendP(next)(res)(req.myObj.getUnconfirm())
    })
    .post(async (req, res, next) => {
        sendP(next)(res)(this.myObj.insertAndFetch(req.body))
    })
    .patch(async (req, res, next) => {
        sendP(next)(res)(this.myObj.patchAndFetch(req.body))
    })
module.exports = router