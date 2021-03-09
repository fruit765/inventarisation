"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const Table = require('../model/facade/facadeTable').FacadeTable

router.route('/posts')
    .all((req, res, next) => {
        this.myObj = new Table("post", req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        const response = this.myObj.getUnconfirm()
        sendP(next)(res)(response)
    })
    .post((req, res, next) => {
        sendP(next)(res)(this.myObj.insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(this.myObj.patchAndFetch(req.body))
    })

module.exports = router