"use strict"

const express = require('express')
const {
    sendP
} = require('../model/libs/command')
const Events = require('../model/libs/events1')
const Brand = require('../model/orm/brand')
const router = express.Router()
const events = new Events()

router.route('/events')
    .get((req, res, next) => {
        sendP(next)(res)(events.getEvents())
    })

module.exports = router