"use strict"

const express = require('express')
const FacadeTabMentoring = require('../model/facade/FacadeTabMentoring').default
const router = express.Router()

router.route('/mentoringFileLoad')
    .all((req, res, next) => {
        req.myObj = new FacadeTabMentoring(req.user.id)
        next()
    })
    .post((req, res, next) => req.myObj.fileLoad(req, res, next))

module.exports = router