import _ from "lodash";
import CreateErr from "../class/createErr";
import GetEvents from "../class/event/GetEvents";
export default class FacadeEvent {

    private readonly handleErr: CreateErr
    private getEvent: GetEvents

    constructor() {
        this.getEvent = new GetEvents()
        this.handleErr = new CreateErr()
    }

    async getEventAll() {
        const allEvents = []
        const allEventsClasses = await this.getEvent.getEventsAll()
        for (let eventClass of allEventsClasses) {
            const event = await eventClass.get()
            allEvents.push(event)
        }
        return allEvents
    }

    async getEventUser(userId: number) {
        const res = await this.getEventAll()
        
    }

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

    async simpleAccept(userId: number, compositeId: string) {
        const eventId = this.strToId(compositeId)
        const event = await this.getEvent.getById(eventId)
        await event.simpleAccept(userId)
        const res = await event.get()
        return res
    }

    async reject(userId: number, compositeId: string) {
        const eventId = this.strToId(compositeId)
        const event = await this.getEvent.getById(eventId)
        await event.reject(userId)
        return event.get()
    }
}