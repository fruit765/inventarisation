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

    private async getRejectNull(confirm: Record<any, any> | null) {
        return await Promise.all(_.map(this.confirmBlocks, (value, key) => {
            return value.getReject(confirm?.confirms?.[String(key)])
        }))
    }

    async getReject(confirm: Record<any, any> | null) {
        const acceptNull = await this.getRejectNull(confirm)
        return _.compact(acceptNull)
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
        const result: Record<string, any> = {}
        for (let key in this.confirmBlocks) {
            const value = this.confirmBlocks[key]
            const x = await value.genReject(confirm?.confirms?.[key], userId)
            if (x != undefined) {
                result[key] = x
            }
        }
        const resultUnion = _.merge({},confirm, {confirms: result})
        return resultUnion
    }

    async genAccept(confirm: Record<any, any> | null, userId: number, type: string, sendObject: any) {
        const result: Record<string, any> = {}
        for (let key in this.confirmBlocks) {
            const value = this.confirmBlocks[key]
            const x = await value.genAccept(confirm?.confirms?.[key], userId, type, sendObject)
            if (x != undefined) {
                result[key] = x
            }
        }
        const resultUnion = _.merge({},confirm, {confirms: result})
        return resultUnion
    }

    async isReject(confirm: Record<any, any> | null) {
        for (let key in this.confirmBlocks) {
            const value = await this.confirmBlocks[key].isReject(confirm?.confirms?.[key])
            if (value) {
                return true
            }
        }
        return false
    }

    async isConfirm(confirm: Record<any, any> | null) {
        const result = []
        for (let key in this.confirmBlocks) {
            const value = await this.confirmBlocks[key].isConfirm(confirm?.confirms?.[key])
            result.push(value)
        }
        return !result.includes(false)
    }
}