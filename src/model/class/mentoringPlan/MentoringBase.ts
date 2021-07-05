import CreateErr from "../createErr"

export default class MentoringBase {
    protected dataObject: any
    protected mentoringId: number
    protected createErr: CreateErr

    constructor(dataObject: any, mentoringId: number) {
        this.mentoringId = mentoringId
        this.createErr = new CreateErr()
        this.init(dataObject)
    }

    protected init(dataObject: any) {
        this.dataObject = dataObject
    }

    replace(data: any) {
        this.init(data)
    }

    update(data: any) {
        this.replace(data)
    }
    
}