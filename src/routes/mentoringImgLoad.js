"use strict"

const express = require('express')
const FacadeTabMentoring = require('../model/facade/FacadeTabMentoring').default
const { sendP } = require('../model/libs/command')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 14)
const multer = require('multer')
const router = express.Router()
const fs = require('fs')
const fsPromises = require('fs').promises

router.route('/mentoringImgLoad')
    .all((req, res, next) => {
        this.myObj = new FacadeTabMentoring(req.user.id)
        next()
    })
    .post((req, res, next) => {
        const id = req.body.id
        fsPromises.mkdir( "./uploaded/mentoring/" + id [, options])
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './uploaded/mentoring/'+req.body.id)
            },
            filename: function (req, file, cb) {
                cb(null, id + "-" + nanoid())
            }
        })
        sendP(next)(res)(this.myObj.loadImg(id,))
    })

module.exports = router