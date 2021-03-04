//@ts-check

"use strict"

const _ = require("lodash")
const PresetOneCol = require("./presetOneCol")

module.exports = class PresetAllCol {
    /**
     * 
     * @param {*} preset 
     */
    constructor(preset) {
        /**
         * @type {(undefined | Promise<boolean>)}
         * @private
         */
        this.initAttr = undefined
        /**
         * @type {any}
         * @private
         */
        this.oldData = {}
        /**
         * @type {any}
         * @private
         */
        this.newData = {}
        /**@private*/
        this.preset = _.isEmpty(preset) ? { column: {}, logic: "false" } : preset
        /**@private*/
        this.column = this.preset.column
        /**@private*/
        this.columnKeys = _.keys(this.column)
        /**
         * @type {string}
         * @private
         */
        this.logic = this.preset.logic ?? this.columnKeys.join(" && ")
        /**@private*/
        this.eval = ""
        /**
          * @type {*}
          * @private
         */
        this.columnClasses = {}
        for (let key in this.column) {
            this.columnClasses[key] = new PresetOneCol(this.column[key])
        }

        this.init()
        this.logicToEval()
    }

    /**
     * Запускает асинхронные процессы для подготовки класса,
     * если они уже запущенны возвращает промис
     */
    async init() {
        if (this.initAttr) {
            return this.initAttr
        } else {
            const promiseArray = []
            for (let key in this.columnClasses) {
                promiseArray.push(this.columnClasses[key].init())
            }
            const initAry = await Promise.all(promiseArray)
            for (let val of initAry) {
                if (!val) {
                    this.initAttr = Promise.resolve(false)
                    return this.initAttr
                }
            }
            this.initAttr = Promise.resolve(true)
            return this.initAttr
        }
    }

    /**
     * Преобразует logic в logicEval строку которая при запуске через eval() возвращает
     * результат сравнения
     * @private
     */
    logicToEval() {
        this.eval = this.logic
        for (let key of this.columnKeys) {
            this.eval = this.eval.replace(
                new RegExp("(?<!\\w)" + key + "(?!\\w)", "gi"),
                `this.columnClasses.${key}.match([this.newData.${key}, this.oldData.${key}])`
            )
        }
    }

    /**
     * Проверяет значение на соответствие пресету
     * Первое значение в массиве относится к новым данным
     * Второе к старым
     * @param {*[]} data 
     */
    match(data) {
        this.newData = data[0] ?? {}
        this.oldData = data[1] ?? {}
        return Boolean(eval(this.eval))
    }
}