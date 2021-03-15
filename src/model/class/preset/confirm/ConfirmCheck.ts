import _ from "lodash"
import { tableRec } from "../../../../type/type"
import ConfirmBlock from "./ConfirmBlock"

export default class ConfirmCheck {
    private confirmBlocks: ConfirmBlock[]
    private personal: number[]

    constructor(confirm: Record<any, any>, hisRec: tableRec.history) {
        this.personal = confirm.personal
        this.confirmBlocks = []
        _.forEach(confirm.confirms, (element, key) => {
            this.confirmBlocks[Number(key)] = new ConfirmBlock(element, hisRec)
        })
    }

    async getNeedConfirm(confirm: Record<any,any>) {
        return Promise.all(_.map(this.confirmBlocks, (value, key) => {
            return value.getNeedConfirm(confirm[key])
        }))
    }

    // async getReject(confirm: Record<any,any>) {
    //     return Promise.all(_.map(this.confirmBlocks, value => {
    //         return value.getReject(confirm)
    //     }))
    // }

    // async getAccept(confirm: Record<any,any>) {
    //     return Promise.all(_.map(this.confirmBlocks, value => {
    //         return value.getAccept(confirm)
    //     }))
    // }

    // async getPersonal(confirm: Record<any,any>) {
    //     const needConfirm = await this.getNeedConfirm(confirm)
    //     const confirm = await this.getAccept(confirm)
    //     for (let key of this.personal) {
    //         confirm[]
    //     }
    //     Object.assign()
    // }
}