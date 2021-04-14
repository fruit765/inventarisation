"use strict"
import { FacadeTableDev } from './../model/facade/facadeTableDev';

const express = require('express')
const { sendP } = require('../model/libs/command')

const router = express.Router()

router.post('/subDevices', async (req, res, next) => {
    const facadeTableDev = new FacadeTableDev(req.user.id)
    if (req.body.id === null) {
        sendP(next)(res)(facadeTableDev.unbindSubDevice(req.user.ids))
    } else {
        sendP(next)(res)(facadeTableDev.bindSubDevice(req.body.id, req.body.ids))
    }
})

module.exports = router