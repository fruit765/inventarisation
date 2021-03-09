//@ts-check

"use strict"

const _ = require("lodash")
const { delUndefinedDeep } = require("../../../libs/objectOp")
const PresetSubCol = require("./presetSubCol")

module.exports = class PresetOneCol {

    /**
     * @typedef {Object} presetOneCol
     * @property {*} [new]
     * @property {*} [old]
     * @param {presetOneCol} preset 
     */
    constructor(preset) {

        /**
         * @type {*}
         * @private
         */
        this.new = {}
        /**
         * @type {*}
         * @private
         */
        this.old = {}

        const presetWithoutUnd = delUndefinedDeep(preset)
        const isNewOldEmpty = !(preset.new && preset.old)
        const isGlobalObjEmpty = _.isEmpty(presetWithoutUnd)
        
        if (isNewOldEmpty && isGlobalObjEmpty) {
            this.new = { logic: "false" }
        } else if(isNewOldEmpty) {
            this.new = presetWithoutUnd
            this.old = { logic: "true" }
        } else {
            this.new = preset.new ?? { logic: "true" }
            this.old = preset.old ?? { logic: "true" }
        }

        /**@private*/
        this.newClass = new PresetSubCol(preset.new)
        /**@private*/
        this.oldClass = new PresetSubCol(preset.old)
    }

    /**
     * Проверяет значение на соответствие пресету
     * Первое значение в массиве относится к новым данным
     * Второе к старым
     * @param {Array<any>} data 
     */
    async match(data) {
        const [newData, oldData] = data
        const res = await this.newClass.match(newData) && await this.oldClass.match(oldData)
        return res
    }
}