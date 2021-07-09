import _ from "lodash"
import { mapArrayOrObject } from "../../libs/objectOp"
import CreateErr from "../createErr"
import MentoringBase from "./MentoringBase"
import MentoringFile from "./MentoringFile"

export default class MentoringBaseIteration {

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
        return this.getDataFromMethod((value: any) => value?.get())
    }

    getWithFilePath() {
        return this.getDataFromMethod((value: any) => value?.getWithFilePath?.() || value?.get())
    }

    getProtege() {
        return this.getDataFromMethod((value: any) => value?.getProtege?.() || value?.getWithFilePath?.() || value?.get())
    }

    isNeedWriteDB() {
        for(let key in this?.objectClasses ?? []) {
            if(this?.objectClasses?.[key]?.isNeedWriteDB?.()) {
                return true
            }
        }
        return false
    }


    protected createClassFromKey(value: any, key: string): any {
        return new MentoringBase(value, this.mentoringId)
    }

    private createAdditionalClass(newPlan: any) {
        return mapArrayOrObject(newPlan, (value, key) => {
            if(!this.objectClasses?.[key]) {
                if(!this.dataObject) {
                    this.dataObject = {}
                }
                return this.createClassFromKey(this.dataObject[key], key)
            } else {
                return this.objectClasses[key]
            }
        })
    }

    update(newPlan: any) {
        const additionalClass = this.createAdditionalClass(newPlan)
        console.log(additionalClass)
        if(_.isObject(this.objectClasses)) {
            this.objectClasses = _.assign(this.objectClasses, additionalClass)
        } else {
            this.objectClasses = additionalClass
        }

        this.getDataFromMethod((value: any, key: string) => {
            if(newPlan?.[key]) {
                value?.update(newPlan[key])
            }
        })
    }

    replace(newPlan: any) {
        // const additionalClass = this.createAdditionalClass(newPlan)

        // mapArrayOrObject(newPlan, (value: any, key: string) => {

        // })

        const additionalClass = mapArrayOrObject(newPlan, (value, key) => {
            if (this.objectClasses?.[key]) {
                const existingClass = this.objectClasses[key]
                existingClass?.replace?.(value)
                return existingClass
            } else {
                if(!this.dataObject) {
                    this.dataObject = {}
                }
                const newClass = this.createClassFromKey(this.dataObject[key], key)
                newClass?.replace?.(value)
                return newClass
            }
        })

        if(_.isObject(this.objectClasses)) {
            this.objectClasses = _.assign(this.objectClasses, additionalClass)
        } else {
            this.objectClasses = additionalClass
        }
    }

    async checkFiles() {
        await MentoringFile.checkFiles(this.objectClasses)
    }

    isComplete() {
        for(let key in this.objectClasses) {
            if(this.objectClasses[key]?.isComplete && !this.objectClasses[key].isComplete()) {
                return false
            }
        }
        return true
    }

    getAllFileName() {
        const fileArrayRaw = _.reduce(this.objectClasses, (result: any, value) => {
            return _.concat(result, value?.getAllFileName?.() ?? [])
        }, [])
        return <string[]><any>_.compact(_.uniq(fileArrayRaw))
    }
}