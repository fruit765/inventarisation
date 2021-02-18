//@ts-check
"use strict"

const Events = require("../libs/events")

/**
 * @class
 * @classdesc Фасад для событий
 */
module.exports = class FacadeEvent {
    /**
     * @param {{actorId: number}} actorId 
     */
    constructor(actorId) {
        this.actorId=actorId
        this.events = new Events()
    }

    getEvents() {
        return Events.getEvents()
    }

    getEventsPersonal() {
        return 
    }

    eventAccept() {

    }

    eventReject() {

    }

    eventBindAct() {

    }

    eventVeto() {

    }


} 