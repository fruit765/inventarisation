"use strict"

const express = require('express')
const FacadeTabMentoring  = require('../model/facade/FacadeTabMentoring').default
const { sendP } = require('../model/libs/command')
const multer  = require('multer')
const router = express.Router()

router.route('/mentoringImgLoad')
    .all((req, res, next) => {
        this.myObj = new FacadeTabMentoring(req.user.id)
        next()
    })
    .post((req, res, next) => {
        const id = req.body.id
        sendP(next)(res)(this.myObj.loadImg(id, ))
    })
    
module.exports = router