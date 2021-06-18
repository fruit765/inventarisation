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
    // .post(async (req, res, next) => {
    //     const path = "./uploaded/mentoring/" + req.body.id
    //     if (!fs.existsSync(path)) {
    //         await fsPromises.mkdir(path, { recursive: true })
    //     }
        
    //     const storage = multer.diskStorage({
    //         destination: function (req, file, cb) {
    //             cb(null, path)
    //         },
    //         filename: function (req, file, cb) {
    //             cb(null, nanoid())
    //         }
    //     })
    //     sendP(next)(res)(this.myObj.loadImg(id,))
    // })

module.exports = router