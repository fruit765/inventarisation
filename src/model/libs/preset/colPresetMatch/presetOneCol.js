//@ts-check

"use strict"

const _ = require("lodash")
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

        if (!(preset.new && preset.old)) {
            this.new = preset
            this.old = { logic: "true" }
        } else {
            this.new = preset.new ?? { logic: "true" }
            this.old = preset.old ?? { logic: "true" }
        }

        /**
         * @type {(undefined | Promise<boolean>)}
         * @private
         */
        this.initAttr = undefined
        /**@private*/
        this.newClass = new PresetSubCol(preset.new)
        /**@private*/
        this.oldClass = new PresetSubCol(preset.old)
        this.init()
    }

    /**
     * Запускает асинхронные процессы для подготовки класса,
     * если они уже запущенны возвращает промис
     */
    async init() {
        if (this.initAttr) {
            return this.initAttr
        } else {
            const initRes = await this.newClass.init() && await this.oldClass.init()
            this.initAttr = Promise.resolve(initRes)
            return this.initAttr
        }
    }

    /**
     * Проверяет значение на соответствие пресету
     * Первое значение в массиве относится к новым данным
     * Второе к старым
     * @param {Array<any>} data 
     */
    match(data) {
        const [newData, oldData] = data
        const res = this.newClass.match(newData) && this.oldClass.match(oldData)
        return res
    }
}