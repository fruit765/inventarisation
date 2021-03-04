//@ts-check
"use strict"

const _ = require("lodash")
const PresetSubCol = require("./presetSubCol")

module.exports = class presetOneCol {
    constructor(preset) {
        this.new = new PresetSubCol(preset.new)
        this.old = new PresetSubCol(preset.old)
        this.init()
    }

    async init() {
        if (this.initAttr) {
            return this.initAttr
        } else {
            const fn = async () => {
                await this.new.init()
                await this.old.init()
                return true
            }
            this.initAttr = fn()
            return this.initAttr
        }
    }
}