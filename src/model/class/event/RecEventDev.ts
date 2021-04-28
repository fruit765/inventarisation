import knex from '../../orm/knexConf'
import RecEvent from './RecEvent'

export default class RecEventDev extends RecEvent{

    // async getEventByUserIds(ids: number[]) {
    //     knex("history").whereIn("device_id", ids).where({"is_complete"})
    //     this.constructor()
    // }

    // async isParentDev() {
    //     const child = await <Promise<any[]>>knex("device").where("parent_id", this.other.table_id)
    //     if (child.length) {
    //         return true
    //     } else {
    //         return false
    //     }
    // }

    // private async simpleAcceptParent() {

    // }

    async simpleAccept(userId: number) {

        // const accept = await super.simpleAccept(userId)

        // if (await this.isParentDev()) {
        //     accept = accept.concat(await this.simpleAcceptParent())
        // } 
        // if(await this.isLastChild()) {
        //     this.constructor()
        //     accept = accept.concat(await this.simpleAcceptIsLastChild())
        // } 
        // return accept
        return super.simpleAccept(userId)
    }

    async reject(userId: number) {
        return super.reject(userId)
    }
}