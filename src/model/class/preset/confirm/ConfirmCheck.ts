import _ from "lodash"
import ConfirmBlock from "./ConfirmBlock"
import TempRep from './../TempRep';

export default class ConfirmCheck {
    private confirmBlocks: ConfirmBlock[]

    constructor(confirm: Record<any, any>, tempRep: TempRep) {
        this.confirmBlocks = []
        _.forEach(confirm.confirms, (element, key) => {
            this.confirmBlocks[Number(key)] = new ConfirmBlock(element, tempRep)
        })
    }

    private async getNeedConfirmNull(confirm: Record<any, any> | null) {
        return await Promise.all(_.map(this.confirmBlocks, (value, key) => {
            return value.getNeedConfirm(confirm?.confirms?.[String(key)])
        }))
    }

    async getNeedConfirm(confirm: Record<any, any> | null) {
        const NeedConfirmNull = await this.getNeedConfirmNull(confirm)
        return _.compact(NeedConfirmNull)
    }

    async getReject(confirm: Record<any, any> | null) {
        const rejectNull = await Promise.all(_.map(this.confirmBlocks, (value, key) => {
            return value.getReject(confirm?.confirms?.[String(key)])
        }))
        return _.compact(rejectNull)
    }

    private async getAcceptNull(confirm: Record<any, any> | null) {
        return await Promise.all(_.map(this.confirmBlocks, (value, key) => {
            return value.getAccept(confirm?.confirms?.[String(key)])
        }))
    }

    async getAccept(confirm: Record<any, any> | null) {
        const acceptNull = await this.getAcceptNull(confirm)
        return _.compact(acceptNull)
    }

    async getPersonal(confirm: Record<any, any> | null) {
        const res: any[] = []
        const acceptNull = await this.getAcceptNull(confirm)
        const NeedConfirmNull = await this.getNeedConfirmNull(confirm)
        for (let key in NeedConfirmNull) {
            if (acceptNull[key] != null) {
                res[Number(key)] = acceptNull[key]?.user_id
            } else {
                res[Number(key)] = NeedConfirmNull[key]?.user_id
            }
        }

        return _.flattenDeep(res)
    }

    async genReject(confirm: Record<any, any> | null, userId: number) {
        return Promise.all(this.confirmBlocks.map((value, key) => {
            return value.genReject(confirm?.[String(key)], userId)
        }))
    }

    async genAccept(confirm: Record<any, any> | null, userId: number, type: string, sendObject: any) {
        return Promise.all(this.confirmBlocks.map((value, key) => {
            return value.genAccept(confirm?.[String(key)], userId, type, sendObject)
        }))
    }
}