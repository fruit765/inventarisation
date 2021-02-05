// @ts-check

"use strict"

const Device = require("../orm/device")
const Table = require("./table")
const _ = require("lodash")
const createError = require('http-errors')
const Status = require("../orm/status")

module.exports = class TableDevice extends Table {

    /**
     * 
     * @param {*} tableClass 
     * @param {Object} options
     * @prop 
     */
    constructor(tableClass, options) {
        super(tableClass, options)
        this.events = TableEvents(tableClass)
    }

    async getWithUnconfirmStatus() {
        await Device.query()
    }
    
    /**
     * 
     * @param {*} pointId
     * @private 
     */
    getPointStatusUnconfirm(pointId) {
        return this.getWithUnconfirmStatus()
            .findById(pointId)
            .first()
            .then(res => res.status)
    }

    /**
     * 
     * @param {*} pointId
     * @private 
     */
    getPointStatus(pointId) {
        return this.query()
            .joinRalated("status")
            .findById(pointId)
            .first()
            .then(res => res.status)
    }

    async bind(dataRaw, acceptStatuses) {
        const id = dataRaw.id
        const currentStatus = await this.getPointStatusUnconfirm(id)
        if (!acceptStatuses.includes(currentStatus)) {
            throw new createError.NotAcceptable("This action is not acceptable with this object")
        }
        const status = await Status.query().where("status", "given").first()
        const data = Object.assign({}, status, dataRaw)
        const response = this.patchAndFetch(data)
        return response
    }

    /**
     * 
     * @param {number} id 
     * @param {Array<number>} eventsNameArray
     */
    async undo(id, eventsNameArray) {
        const statusUnconfirm = await this.getPointStatusUnconfirm(id)
        const statusConfirm = await this.getPointStatus(id)
        const confirmArray = await this.events.confirmsArray(id) //ffffffffff
        if (statusUnconfirm === statusConfirm || !confirmArray.length) {
            throw new createError.NotAcceptable("This action is not acceptable with this object")
        }

        this.events.eventReject(id)


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