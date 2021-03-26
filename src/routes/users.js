"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const FacadeTable = require('../model/facade/facadeTable').FacadeTable
const Password = require("../model/orm/password")
const _ = require("lodash")

router.route('/users')
    .all((req, res, next) => {
        req.myObj = new FacadeTable("User", (req.user)?.id)
        next()
    })
    .get((req, res, next) => {
        sendP(next)(res)(req.myObj.getUnconfirm())
    })
    .post(async (req, res, next) => {
        const result = await req.myObj.insertAndFetch(_.omit(req.body, "password"))
        if(req.body.password) {
            await Password.query().insert({id: result.id, password: req.body.password})
        }
        sendP(next)(res)(result)
    })
    .patch(async (req, res, next) => {
        const result = await req.myObj.patchAndFetch(_.omit(req.body, "password"))
        if(req.body.password) {
            await Password.query().findById(result.id).patch({password: req.body.password})
        }
        sendP(next)(res)(res)
    })

module.exports = router