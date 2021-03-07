//@ts-check

"use strict"
/**
 * @typedef {Object} presetRec
 * @property {number} id
 * @property {*} table
 * @property {*} preset
 * @property {*} confirm
 * @property {*} additional
 * @property {*} start_preset_date
 * @property {string} name
 * @property {string} name_rus
 * @property {*} end_preset_date
 * @property {number} view_priority
 * @property {number} status_id
 */

//const _ = require("lodash")
const Event_confirm = require("../../orm/event_confirm")
const PresetAllCol = require("./colPresetMatch/presetAllCol")
const dayjs = require("dayjs")
const Event_confirm_preset = require("../../orm/event_confirm_preset")

module.exports = class Preset {

    /**
     * Возвращает активные пресеты
     */
    static async getActualPresets() {
        const curretDataTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        /**@type {presetRec[]} */
        const presets = await Event_confirm_preset.query()
            .where("start_preset_date", "<", curretDataTime)
            .andWhere(
                /**@this {any}*/
                function () {
                    this
                        .whereNull("end_preset_date")
                        .orWhere("end_preset_date", ">", curretDataTime)
                }
            )

        return presets.map(x => new this(x))
    }

    /**
     * @param {presetRec} presetRec 
     */
    constructor(presetRec) {
        // /**
        //  * @type {(null | cache)}
        //  * @private
        //  */
        // this.cache = null
        /**
         * @type {number}
         * @private
         */
        this.id = presetRec.id
        /**@private*/
        this.presetAllCol = new PresetAllCol(presetRec.preset)
    }

    // detachCache() {
    //     this.cache = null
    // }

    // attachCache(cache) {
    //     if (!cache.cache) {
    //         cache.cache = {}
    //     }
    //     this.cache = cache
    // }

    /**
     * Проверяет запись в истории на соответствии пресету,
     * если соответствует генерирует событие
     * @param {*} hisRec 
     * @param {*} actualData 
     */
    async genEventsByHisRec(hisRec, actualData) {
        await this.presetAllCol.init()
        if (this.presetAllCol.match([hisRec.diff, actualData])) {
            await Event_confirm.query()
                .insert(
                    {
                        history_id: hisRec.id,
                        event_confirm_preset_id: this.id,
                        status: "pending"
                    })
                .onConflict()
                .ignore()
        }
    }
}