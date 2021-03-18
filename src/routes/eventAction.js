"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const FacadeEvent = require('../model/facade/facadeEvent').default

router.route('/eventAction')
    .all((req, res, next) => {
        req.myObj = new FacadeEvent()
        next()
    })
    .post(async (req, res, next) => {
        if (req.query.action === "simpleAccept") {
            const response = req.myObj.simpleAccept(req.user.id, req.body.id)
            sendP(next)(res)(response)
        } else if (req.query.action === "reject") {
            const response = req.myObj.reject(req.user.id, req.body.id)
            sendP(next)(res)(response)
        }
    })

module.exports = router