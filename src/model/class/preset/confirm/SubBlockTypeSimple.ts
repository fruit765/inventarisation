import { classInterface } from "../../../../type/type"

export default class SubBlockTypeSimple implements classInterface.typeStrategy {

    constructor(typeDesc: any) {

    }

    async isConfirm(type: Record<any,any>) {
        return type?.action === "accept" && type?.type === "simple"
    }

    async genAccept() {
        return {
            action: "accept",
            type: "simple"
        }
    }
}