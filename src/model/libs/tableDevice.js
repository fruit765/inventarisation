"use strict"

const Device = require("../orm/device")
const Table = require("./table")
const _ = require("lodash")
const createError = require('http-errors')

module.exports = class TableDevice extends Table {
    async getWithUnconfirmStatus() {
        await Device.query()
    }

    async _checkPointStatus(pointId, statuses) {
        const response = await this._getPointStatusObj()
            .whereIn("status", statuses)

        return response ? response : null
    }

    _getPointStatusObj(pointId) {
        return this.getWithUnconfirmStatus()
            .findById(pointId)
            .first()
    }

    _getPointStatusStr(pointId) {
        return this.getWithUnconfirmStatus()
            .findById(pointId)
            .first()
            .then(res => res.status)
    }

    async bind(dataRaw, acceptStatuses) {
        const status = _getPointStatusStr
        if (acceptStatuses.includes(await _getPointStatusStr())) {
            throw new createError.NotAcceptable("This action is not acceptable with this object")
        }

        const status = await Status.query().where("status", "given").first()
        const data = Object.assign({}, status, dataRaw)
        const response = this.patchAndFetch(data)
        return response
    }

    async undo(dataRaw) {
        this._checkPointStatus(dataRaw.id, acceptStatuses)
        const status = await Status.query().where("status", "given").first()
        const data = Object.assign({}, status, dataRaw)
        const response = this.patchAndFetch(data)
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