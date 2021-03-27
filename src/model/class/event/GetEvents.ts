import _ from "lodash"
import { otherType, tableRec } from "../../../type/type"
import Event_confirm from "../../orm/event_confirm"
import Event_confirm_preset from "../../orm/event_confirm_preset"
import History from "../../orm/history"
import RecEvent from './RecEvent'

/**
 * Класс фабрика событий
 * @class
 */
export default class GetEvents {

    /**Возвращает все события*/
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

    /**Возвращает события пользователя */
    async getEventUser(userId: number) {
        const result = []
        const eventsAll = await this.getEventsAll()
        for(let value of eventsAll) {
            if(await value.isOfficial(userId)) {
                result.push(value)
            }
        }
        return result
    }

    /**Возвращает события по ключу */
    async getById(eventKey: otherType.eventKey) {
        const history: tableRec.history = <any>await History.query().findById(eventKey.history_id)
        const preset: tableRec.preset = <any>await Event_confirm_preset.query().findById(eventKey.event_confirm_preset_id)
        const event: tableRec.event = <any>await Event_confirm.query().first().where(eventKey)
        return new RecEvent(event, history, preset)
    }

}