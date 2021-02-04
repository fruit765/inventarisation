"use strict"

const Device = require("../orm/device")
const Table = require("./table")
const _ = require("lodash")
const createError = require('http-errors')

module.exports = class TableDevice extends Table {
    async getWithUnconfirmStatus() {
        await Device.query()
    }

    _getPointStatusUnconfirm(pointId) {
        return this.getWithUnconfirmStatus()
            .findById(pointId)
            .first()
            .then(res => res.status)
    }

    _getPointStatus(pointId) {
        return this.query()
            .joinRalated("status")
            .findById(pointId)
            .first()
            .then(res => res.status)
    }

    async bind(dataRaw, acceptStatuses) {
        const id = dataRaw.id
        const currentStatus = await _getPointStatusUnconfirm(id)
        if (!acceptStatuses.includes(currentStatus)) {
            throw new createError.NotAcceptable("This action is not acceptable with this object")
        }
        const status = await Status.query().where("status", "given").first()
        const data = Object.assign({}, status, dataRaw)
        const response = this.patchAndFetch(data)
        return response
    }

    async undo(dataRaw) {
        const id = dataRaw.id
        const statusUnconfirm = await this._getPointStatusUnconfirm(id)
        const statusConfirm = await this._getPointStatus(id)

        if (statusUnconfirm === statusConfirm && .isNoOneConfirm(id)) {
            throw new createError.NotAcceptable("This action is not acceptable with this object")
        }


        return response
    }

    async unbind(dataRaw) {
        const status = await Status.query().where("status", "given").first()
        const data = Object.assign({}, status, dataRaw)
        const response = this.patchAndFetch(data)
        return response
    }

    async remove(dataRaw) {
        const status = await Status.query().where("status", "given").first()
        const data = Object.assign({}, status, dataRaw)
        const response = this.patchAndFetch(data)
        return response
    }
}