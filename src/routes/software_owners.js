"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Table = require('../model/facade/facadeTable').FacadeTable
const router = express.Router()
const _ = require("lodash")

router.route('/software_owners')
    .all((req, res, next) => {
        this.myObj = new Table("software_owner", req.user.id)
        next()
    })
    .get((req, res, next) => {
        const filterObj = _.omitBy({
            device_id: req.query.device_id,
            software_id: req.query.software_id
        }, _.isUndefined)
        const response = this.myObj.getUnconfirm().then(x => _.filter(x, filterObj))
        sendP(next)(res)(response)
    })

module.exports = router