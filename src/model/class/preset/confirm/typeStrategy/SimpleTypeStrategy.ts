import { classInterface } from "../../../../../type/type";

export default class SimpleTypeStrategy implements classInterface.typeStrategy {

    async isConfirm(type: any) {
        return type.action === "accept" && type.type === "simple"
    }

    async isReject(type: any) {
        return type.action === "reject" && type.type === "simple"
    }
}