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
        const res = await req.myObj.insertAndFetch(_.omit(req.body, "password"))
        if(req.body.password) {
            req.body.password = null
        }
        Password.query().insert({id: res.id, password: req.body.password})
        sendP(next)(res)(res)
    })
    .patch((req, res, next) => {
        const res = await req.myObj.patchAndFetch(_.omit(req.body, "password"))
        if(req.body.password) {
            req.body.password = undefined
        }
        Password.query().insert(_.pickBy({id: res.id, password: req.body.password}, Boolean))
        sendP(next)(res)(res)
    })

module.exports = router