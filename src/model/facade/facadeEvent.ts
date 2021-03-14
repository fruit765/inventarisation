import GetEvents from "../class/event/GetEvents";

export default class facadeEvent {

    private getEvent: GetEvents

    constructor() {
        this.getEvent = new GetEvents()
    }

    async getEventAll() {
        const allEvents = []
        const allEventsClasses = await this.getEvent.getEventsAll()
        for (let eventClass of allEventsClasses) {
            const event = eventClass.get()
            allEvents.push(event)
        }
        return allEvents
    }

    getEventPersonal() {
        
    }
}