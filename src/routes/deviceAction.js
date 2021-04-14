"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const FacadeTableDev = require('../model/facade/facadeTableDev').FacadeTableDev

router.route('/deviceAction')
    .all((req, res, next) => {
        req.myObj = new FacadeTableDev(req.user.id)
        next()
    })
    .post(async (req, res, next) => {
        if (req.query.action === "bind") {
            const response = req.myObj.bind(req.body.id, req.body.user_id)
            sendP(next)(res)(response)
        } else if (req.query.action === "remove") {
            const response = req.myObj.remove(req.body.id, req.body.user_id)
            sendP(next)(res)(response)
        }
    })

module.exports = router