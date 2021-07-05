import _ from "lodash"
import { mapArrayOrObject } from "../../libs/objectOp"
import CreateErr from "../createErr"
import MentoringBase from "./MentoringBase"
import MentoringFile from "./MentoringFile"

export default class MentoringBaseIteration  {

    protected dataObject: any
    protected mentoringId: number
    protected createErr: CreateErr
    protected objectClasses: any

    constructor(dataObject: any, mentoringId: number) {
        this.mentoringId = mentoringId
        this.createErr = new CreateErr()
        this.dataObject = dataObject
        this.objectClasses = mapArrayOrObject(dataObject, (value, key) => this.createClassFromKey(value, key))
    }

    protected getDataFromMethod(fn: Function) {
        if (!this.dataObject) {
            return this.dataObject
        }

        return mapArrayOrObject(this.objectClasses, (value, key) => {
            return fn(value, key)
        })
    }

    get() {
        return this.getDataFromMethod((value: any) => value.get())
    }

    getWithFilePath() {
        return this.getDataFromMethod((value: any) => value?.getWithFilePath?.() || value.get())
    }

    getProtege() {
        return this.getDataFromMethod((value: any) => value?.getProtege?.() || value?.getWithFilePath?.() || value.get())
    }


    protected createClassFromKey(value: any, key: string): any {
        return new MentoringBase(value, this.mentoringId)
    }

    update(newPlan: any) {
        const additionalClass = mapArrayOrObject(newPlan, (value, key) => {
            if (this.objectClasses?.[key]) {
                return this.dataObject[key]?.update(value)
            } else {
                return this.createClassFromKey(undefined, key)?.update(value)
            }
        })

        Object.assign(this.objectClasses, additionalClass)
    }

    replace(newPlan: any) {
        const additionalClass = mapArrayOrObject(newPlan, (value, key) => {
            if (this.objectClasses?.[key]) {
                return this.dataObject[key]?.replace(value)
            } else {
                return this.createClassFromKey(undefined, key)?.replace(value)
            }
        })

        Object.assign(this.objectClasses, additionalClass)
    }

    async checkFiles() {
        await MentoringFile.checkFiles(this.objectClasses)
    }

    getAllFileName() {
        const fileArrayRaw = _.reduce(this.objectClasses, (result: any, value) => {
            return _.concat(result, value.getAllFileName() ?? [])
        }, [])
        return <string[]><any>_.compact(_.uniq(fileArrayRaw))
    }
}