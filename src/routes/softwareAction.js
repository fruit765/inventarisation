"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const FacadeTabSoftware = require('../model/facade/facadeTabSoftware').default

router.route('/softwareAction')
    .all((req, res, next) => {
        this.myObj = new FacadeTabSoftware(req.user.id)
        next()
    })
    .post(async (req, res, next) => {
        let response
        if (req.query.action === "bind") {
            response = this.myObj.bind(req.body.software_id, req.body)
        } else if (req.query.action === "unbind") {
            response = this.myObj.unbind(req.body.software_id, req.body)
        }
        sendP(next)(res)(response)
    })

module.exports = router