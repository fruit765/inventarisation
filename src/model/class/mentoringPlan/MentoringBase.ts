import _ from "lodash"
import CreateErr from "../createErr"

export default class MentoringBase {
    protected dataObject: any
    protected mentoringId: number
    protected createErr: CreateErr

    constructor(dataObject: any, mentoringId: number) {
        this.mentoringId = mentoringId
        this.createErr = new CreateErr()
        this.replaceDataObject(dataObject)
    }

    protected replaceDataObject(dataObject: any) {
        this.dataObject = dataObject
    }

    get() {
        return this.dataObject
    }

    replace(data: any) {
        this.replaceDataObject(data)
    }

    update(data: any) {
        const newObject = _.merge({},this.dataObject, data)
        this.replace(newObject)
    }

    
    
}