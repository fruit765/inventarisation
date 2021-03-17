import { classInterface } from "../../../../type/type";

export default class SubBlockTypeSimple implements classInterface.typeStrategy {

    async isConfirm(type: any) {
        return type?.action === "accept" && type?.type === "simple"
    }

    async isReject(type: any) {
        return type?.action === "reject" && type?.type === "simple"
    }

    async genReject() {
        return {
            action: "reject",
            type: "simple"
        }
    }

    async genAccept() {
        return {
            action: "accept",
            type: "simple"
        }
    }

    getName() {
        return "simple"
    }
}