import RecEvent from './RecEvent'

export default class RecEventDev extends RecEvent{
    async simpleAccept(userId: number) {
        // const GetEvents = await (import ("./GetEvents")).then(x => x.default)
        // const getEvent = new GetEvents()
        
        // this.isCompDev()=
        return super.simpleAccept(userId)
    }

    async reject(userId: number) {
        return super.reject(userId)
    }
}