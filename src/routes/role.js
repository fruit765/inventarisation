"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const { FacadeTable } = require('../model/facade/facadeTable')

router.route('/roles')
    .all((req, res, next) => {
        this.myObj = new FacadeTable("Role", req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        const response = this.myObj.getUnconfirm()
        sendP(next)(res)(response)
    })
// .post((req, res, next) => {
//     sendP(next)(res)(this.myObj.insertAndFetch(req.body))
// })
// .patch((req, res, next) => {
//     sendP(next)(res)(this.myObj.patchAndFetch(req.body))
// })
// .delete((req, res, next) => {
//     sendP(next)(res)(this.myObj.delete(req.body.id))
// })

module.exports = router