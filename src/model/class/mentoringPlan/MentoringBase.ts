import _ from "lodash"
import CreateErr from "../createErr"

export default class MentoringBase {
    protected dataObject: any
    protected mentoringId: number
    protected createErr: CreateErr

    constructor(dataObject: any, mentoringId: number) {
        this.mentoringId = mentoringId
        this.createErr = new CreateErr()
        this.initObject(dataObject)
    }

    protected initObject(dataObject: any) {
        this.dataObject = dataObject
    }

    get() {
        return this.dataObject
    }

    replace(data: any) {
        this.initObject(data)
    }

    update(data: any) {
        const newObject = _.merge({},this.dataObject, data)
        this.replace(newObject)
    }

    
    
}