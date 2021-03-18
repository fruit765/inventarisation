
import dayjs from 'dayjs'
import { classInterface } from '../../../../type/type'
import CreateErr from './../../createErr'
import SubBlockTypeSimple from './SubBlockTypeSimple'

export default class SubBlockType implements classInterface.typeStrategy {

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

    async genBase() {
        return {
            date: dayjs().toISOString()
        }
    }

    async isConfirm(type: Record<any,any>) {
        return this.typeStrategy.isConfirm(type)
    }

    async isReject(type: Record<any,any>) {
        return this.typeStrategy.isReject(type)
    }

    async genReject() {
        return this.typeStrategy.genReject()
    }

    async genAccept(sendObject: any) {
        return this.typeStrategy.genAccept(sendObject)
    }

    getName() {
        return this.type
    }
}