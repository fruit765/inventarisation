"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const Table = require('../model/facade/facadeTable').FacadeTable

router.route('/employers')
    .all((req, res, next) => {
        this.myObj = new Table("employer", req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        const response = this.myObj.get()
        sendP(next)(res)(response)
    })
    .post((req, res, next) => {
        sendP(next)(res)(this.myObj.insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(this.myObj.patchAndFetch(req.body))
    })
    .delete((req, res, next) => {
        sendP(next)(res)(this.myObj.delete(req.body.id))
    })

module.exports = router