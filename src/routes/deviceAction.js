"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Device = require('../model/orm/device')
const History = require('../model/orm/history')
const Status = require('../model/orm/status')
const router = express.Router()
const fp = require("lodash/fp")

router.route('/deviceAction')
    .post((req, res, next) => {
        if (req.query.action === "bind") {
            
        } else if (req.query.action === "remove") {

        }
        send(next)(res)(insertTable(Device)(req.body))
    })

module.exports = router