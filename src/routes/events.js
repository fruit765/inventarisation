"use strict"

const FacadeEvent = require('./../model/facade/facadeEvent').default
const express = require('express')
const { sendP } = require('../model/libs/command')

const router = express.Router()

router.route('/events')
    .all((req, res, next) => {
        req.myObj = new FacadeEvent()
        next()
    })
    .get((req, res, next) => {
        sendP(next)(res)(req.myObj.getEventAll())
    })

module.exports = router