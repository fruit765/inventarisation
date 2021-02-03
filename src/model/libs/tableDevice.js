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
        const response = await this.getWithUnconfirmStatus()
            .findById(pointId)
            .whereIn("status", statuses)
            .first()

        if (response) {
            return response
        } else {
            throw new createError.NotAcceptable("This action is not acceptable with this object")
        }

    }

    async bind(dataRaw, acceptStatuses) {
        this._checkPointStatus(dataRaw.id, acceptStatuses)
        const status = await Status.query().where("status", "given").first()
        const data = Object.assign({}, status, dataRaw)
        const response = this.patchAndFetch(data)
        return response
    }

    async undo(dataRaw) {
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