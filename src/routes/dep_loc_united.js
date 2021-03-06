"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Dep_loc = require('../model/orm/dep_loc')
const router = express.Router()

router.route('/dep_loc_united')
    .all(async (req, res, next) => {
        // req.myObj = new facadeTable(Dep_loc, req.user?.id)
        // await req.myObj.init()
        next()
    })
    .get(async (req, res, next) => {
        let response = Dep_loc
            .query()
            .joinRelated("[department, location]")
            .select("dep_loc.id", "department", "location")

        sendP(next)(res)(response)
    })
    // .post(async (req, res, next) => {
    //     req.body.
    //     table.insertAndFetch()
    // })
     

module.exports = router