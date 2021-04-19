"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Table = require('../model/facade/facadeTable').FacadeTable
const router = express.Router()

router.route('/software_owners')
    .all((req, res, next) => {
        this.myObj = new Table("software_owner", req.user.id)
        next()
    })
    .get((req, res, next) => {
        sendP(next)(res)(this.myObj.getUnconfirm())
    })

module.exports = router 