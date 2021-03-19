
import dayjs from 'dayjs'
import { classInterface } from '../../../../type/type'
import CreateErr from './../../createErr'
import SubBlockTypeSimple from './SubBlockTypeSimple'

export default class SubBlockType {

    private handleErr: CreateErr
    private typeStrategy: classInterface.typeStrategy
    private type: string

    constructor(typeInPreset: string, typeDesc: Record<any,any>) {
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

    async isConfirm(type: Record<any,any>) {
        return this.typeStrategy.isConfirm(type)
    }

    async isReject(type: Record<any,any>) {
        return this.typeStrategy.isReject(type)
    }

    async genReject(userId: number) {
        const base = this.genBase(userId)
        const reject = this.typeStrategy.genReject()
        return Object.assign(base, reject)
    }

    async genAccept(userId: number, sendObject: any) {
        const base = this.genBase(userId)
        const accept = this.typeStrategy.genAccept(sendObject)
        return Object.assign(base, accept)
    }

    getName() {
        return this.type
    }
}