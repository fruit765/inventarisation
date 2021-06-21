"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const router = express.Router()
const Table = require('../model/facade/facadeTabRelCat').default

router.route('/suppliers')
    .all((req, res, next) => {
        req.myObj = new Table("Supplier", req.user.id)
        next()
    })
    .get(async (req, res, next) => {
        const response = req.query.catId ?
            req.myObj.getByCatId(req.query.catId) :
            req.myObj.get()

        sendP(next)(res)(response)
    })
    .post((req, res, next) => {
        sendP(next)(res)(req.myObj.insertAndFetch(req.body))
    })
    .patch((req, res, next) => {
        sendP(next)(res)(req.myObj.patchAndFetch(req.body))
    })
    .delete((req, res, next) => {
        sendP(next)(res)(req.myObj.delete(req.body.id))
    })

module.exports = router