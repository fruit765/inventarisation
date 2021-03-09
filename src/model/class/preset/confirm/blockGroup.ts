export default class BlockGroup {
    private group: string
    private groupRec: any

    constructor(groupRec: any) {
        this.groupRec = groupRec
        this.group = "NoName"
        if (typeof groupRec === "string") {
            this.group = groupRec
        }
    }

    /**Возвращает имя группы*/
    get() {
        return this.group
    }
}