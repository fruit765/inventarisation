"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const { FacadeTable } = require('../model/facade/facadeTable')

router.route('/roles')
    .all((req, res, next) => {
        req.myObj = new FacadeTable("Role", req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        const response = req.myObj.getUnconfirm()
        sendP(next)(res)(response)
    })
// .post((req, res, next) => {
//     sendP(next)(res)(req.myObj.insertAndFetch(req.body))
// })
// .patch((req, res, next) => {
//     sendP(next)(res)(req.myObj.patchAndFetch(req.body))
// })
// .delete((req, res, next) => {
//     sendP(next)(res)(req.myObj.delete(req.body.id))
// })

module.exports = router