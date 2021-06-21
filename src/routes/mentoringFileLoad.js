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

router.route('/mentoringFileLoad')
    .all((req, res, next) => {
        req.myObj = new FacadeTabMentoring(req.user.id)
        next()
    })
    .post((req, res, next) => req.myObj.fileLoad(req, res, next))

module.exports = router