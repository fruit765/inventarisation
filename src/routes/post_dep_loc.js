"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const Table = require('../model/facade/facadeTable').FacadeTable

router.route('/post_dep_loc')
    .all((req, res, next) => {
        req.myObj = new Table("post_dep_loc", req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        const response = req.myObj.getUnconfirm()
        sendP(next)(res)(response)
    })
    .post((req, res, next) => {
        sendP(next)(res)(req.myObj.insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(req.myObj.patchAndFetch(req.body))
    })

module.exports = router