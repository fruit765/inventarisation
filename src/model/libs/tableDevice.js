"use strict"

const Device = require("../orm/device")
const Table = require("./table")

module.exports = class TableDevice {
    constructor(tableClass, options) {
       
    }

    async getWithVirtStatus() {
        await Device.query()
        
    }
}