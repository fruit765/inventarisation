"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Table = require('../model/facade/facadeTable').FacadeTable
const createError = require('http-errors')
const router = express.Router()
const Account_owner = require("../model/orm/account_owner")

router.route('/account_owners')
    .all((req, res, next) => {
        req.myObj = new Table("account_owner", req.user.id)
        next()
    })
    .get((req, res, next) => {
        sendP(next)(res)(Account_owner.query()
            .skipUndefined()
            .where({ user_id: req.query.userId, dep_loc_id: req.query.depLocId, account_id: req.query.accountId })
        )
    })
    .post((req, res, next) => {
        if (
            (req.body.dep_loc_id == undefined) &&
            (req.body.user_id == undefined)) {
            throw createError(400, "dep_loc_id or user_id must be not empty")
        } else if (
            (req.body.dep_loc_id != undefined) &&
            (req.body.user_id != undefined)) {
            throw createError(400, "dep_loc_id and user_id can't both contain values")
        }

        sendP(next)(res)(req.myObj.insertAndFetch(req.body))
    })
    .delete((req, res, next) => {
        if (Object.keys(req.body).length === 0) {
            throw table.createError400Pattern("object", "object must be not empty")
        }
        sendP(next)(res)(req.myObj.delete(req.body.id))
    })

module.exports = router 