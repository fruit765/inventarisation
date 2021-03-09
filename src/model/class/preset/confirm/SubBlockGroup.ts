import TempRep from './../tempRep';

export default class SubBlockGroup {
    private group: string
    private groupRec: any
    private tempRep: TempRep

    constructor(groupRec: any, tempRep: TempRep) {
        this.tempRep = tempRep
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