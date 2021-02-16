"use strict"

const express = require('express')
const {
    sendP
} = require('../model/libs/command')
const Events = require('../model/libs/events')
const Brand = require('../model/orm/brand')
const router = express.Router()

router.route('/events')
    .get((req, res, next) => {
        sendP(next)(res)(Events.getEvents())
    })

module.exports = router