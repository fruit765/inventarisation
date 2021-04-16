"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const Table = require('../model/facade/facadeTable').FacadeTable

router.route('/softwareCategory')
    .all((req, res, next) => {
        this.myObj = new Table("software_category", req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        const response = this.myObj.getUnconfirm()
        sendP(next)(res)(response)
    })

module.exports = router