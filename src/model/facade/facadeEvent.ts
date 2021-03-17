import GetEvents from "../class/event/GetEvents";
export default class FacadeEvent {

    private getEvent: GetEvents

    constructor() {
        this.getEvent = new GetEvents()
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

    getEventPersonal(userId: number) {
        
    }
}