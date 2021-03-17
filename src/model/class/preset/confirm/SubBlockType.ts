
import { classInterface } from '../../../../type/type';
import CreateErr from './../../createErr';
import SubBlockTypeSimple from './SubBlockTypeSimple';
export default class SubBlockType implements classInterface.typeStrategy {

    private handleErr: CreateErr
    private typeStrategy: classInterface.typeStrategy

    constructor(typeInPreset: string, typeDesc: any) {
        this.handleErr = new CreateErr()
        switch (typeInPreset) { //NOSONAR
            case "simple":
                this.typeStrategy = new SubBlockTypeSimple()
                break
            default:
                throw this.handleErr.internalServerError("wrong confirm type")
        }
    }

    async isConfirm(type: any) {
        return this.typeStrategy.isConfirm(type)
    }

    async isReject(type: any) {
        return this.typeStrategy.isReject(type)
    }

    async genReject() {
        return this.typeStrategy.genReject()
    }

    async genAccept(sendObject: any) {
        return this.typeStrategy.genAccept(sendObject)
    }

    getName() {
        return this.typeStrategy.getName()
    }
}