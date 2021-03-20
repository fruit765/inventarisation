
import dayjs from 'dayjs'
import { classInterface } from '../../../../type/type'
import CreateErr from './../../createErr'
import SubBlockTypeSimple from './SubBlockTypeSimple'

export default class SubBlockType {

    private handleErr: CreateErr
    private typeStrategy: classInterface.typeStrategy
    private type: string

    constructor(typeInPreset: string, typeDesc: Record<any, any>) {
        this.type = typeInPreset
        this.handleErr = new CreateErr()
        switch (typeInPreset) { //NOSONAR
            case "simple":
                this.typeStrategy = new SubBlockTypeSimple()
                break
            default:
                throw this.handleErr.internalServerError("wrong confirm type")
        }
    }

    async genBase(userId: number) {
        return {
            date: dayjs().toISOString(),
            id: userId
        }
    }

    async isConfirm(type: Record<any, any>) {
        return this.typeStrategy.isConfirm(type)
    }

    async isReject(type: Record<any,any>) {
        return type?.action === "reject"
    }

    async genReject(userId: number) {
        const reject = {
            action: "reject",
            type: this.type
        }
        const base = await this.genBase(userId)
        return Object.assign(base, { type: reject })

    }

    async genAccept(userId: number, sendObject: any) {
        const accept = await this.typeStrategy.genAccept(sendObject)
        if (accept) {
            const base = await this.genBase(userId)
            return Object.assign(base, { type: accept })
        }
    }

    getName() {
        return this.type
    }
}