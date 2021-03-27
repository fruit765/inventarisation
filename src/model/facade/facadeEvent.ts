import _ from "lodash";
import CreateErr from "../class/createErr";
import GetEvents from "../class/event/GetEvents";

/**
 * Класс фасад для событий
 * @class
 */
export default class FacadeEvent {

    private readonly handleErr: CreateErr
    private getEvent: GetEvents

    constructor() {
        this.getEvent = new GetEvents()
        this.handleErr = new CreateErr()
    }

    /**Получить данные всех событий */
    async getEventAll() {
        const allEvents = []
        const allEventsClasses = await this.getEvent.getEventsAll()
        for (let eventClass of allEventsClasses) {
            const event = await eventClass.get()
            allEvents.push(event)
        }
        return allEvents
    }

    /**Получить данные только событий пользователя*/
    async getEventUser(userId: number) { 
        const events = []
        const eventsClasses = await this.getEvent.getEventUser(userId)
        for (let eventClass of eventsClasses) {
            const event = await eventClass.get()
            events.push(event)
        }
        return events
    }

    /**
     * Получает из строки композитный ключ
     * @param strId "1,2" 
     * @returns [1,2]
     */
    private strToId(strId: string) {
        let eventIdArray: number[]
        try {
            eventIdArray = String(strId).split(",").map(x => Number(x))
            if (!(_.isArray(eventIdArray) && eventIdArray[0] != null && eventIdArray[1] != null)) {
                throw ""
            }
        } catch (err) {
            throw this.handleErr.eventIdWrong()
        }

        return {
            history_id: eventIdArray[0], 
            event_confirm_preset_id: eventIdArray[1]
        }
    }

    /**Поростое подтверждение события */
    async simpleAccept(userId: number, compositeId: string) {
        const eventId = this.strToId(compositeId)
        const event = await this.getEvent.getById(eventId)
        await event.simpleAccept(userId)
        const res = await event.get()
        return res
    }

    /**Отклонение события */
    async reject(userId: number, compositeId: string) {
        const eventId = this.strToId(compositeId)
        const event = await this.getEvent.getById(eventId)
        await event.reject(userId)
        return event.get()
    }
}