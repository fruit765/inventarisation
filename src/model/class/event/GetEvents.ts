import _ from "lodash"
import { tableRec } from "../../../type/type"
import Event_confirm from "../../orm/event_confirm"
import Event_confirm_preset from "../../orm/event_confirm_preset"
import History from "../../orm/history"
import RecEvent from './RecEvent'

export default class GetEvents {

    async getEventsAll() {
        let eventClasses = []
        const allEvents: tableRec.event[] = <any>await Event_confirm.query()
        const allHistory: tableRec.history[] = <any>await History.query()
        const allPreset = await Event_confirm_preset.query()
        const allHistoryIndex = _.keyBy(allHistory, "id")
        const allPresetIndex = _.keyBy(allPreset, "id")
        for (let value of allEvents) {
            eventClasses.push(new RecEvent(
                value,
                allHistoryIndex[String(value.history_id)],
                allPresetIndex[String(value.event_confirm_preset_id)]))
        }
        return eventClasses
    }

    async getPersonal(userId: number) {
        const allEvent = await this.getEventsAll()

    }

    // async getById(composeKey: string) {
    //     let a: number[]
    //     try {
    //         a = JSON.parse(composeKey)
    //         if (!(_.isArray(a) && a[0] != null && a[1] != null)) {
    //         }
    //         }
    //     }
        
    // const allEvents: tableRec.event[] = <any>await Event_confirm.query()
    // const allHistory: tableRec.history[] = <any>await History.query()
    // const allPreset = await Event_confirm_preset.query()
    // const allHistoryIndex = _.keyBy(allHistory, "id")
    // const allPresetIndex  =  _.keyBy(allPreset, "id")
    // for (let value of allEvents) {
    //     eventClasses.push(new RecEvent(
    //         value, 
    //         allHistoryIndex[String(value.history_id)], 
    //         allPresetIndex[String(value.event_confirm_preset_id)]))
    // }
    // return eventClasses
}