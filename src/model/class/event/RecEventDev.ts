import RecEvent from './RecEvent'

export default class RecEventDev extends RecEvent{
    async simpleAccept(userId: number) {
        return super.simpleAccept(userId)
    }

    async reject(userId: number) {
        super.reject(userId)
    }
}