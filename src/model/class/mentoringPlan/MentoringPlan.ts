import _ from "lodash"
import MentoringTest from "./MentoringTest"
import MentoringTask from "./MentoringTask"
import MentoringBlocks from "./MentoringBlocks"
import MentoringFile from "./MentoringFile"

/**
 * Класс отвечает за план в системе наставнечества
 * @class
 */
export default class MentoringPlan {

    private planObject
    private planObjClasses: any
    private mentoringFile
    private mentoringId: number

    constructor(planObject: any, mentoringId: number) {
        this.mentoringId = mentoringId
        this.planObject = planObject
        this.planObjClasses = _.mapValues(planObject, (value, key) => this.createClassFromKey(value, key))
        this.mentoringFile = new MentoringFile(mentoringId)
    }

    private createClassFromKey(value: any, key: string) {
        if (key === "blocks") {
            return new MentoringBlocks(value, this.mentoringId)
        } else if (key === "test") {
            return new MentoringTest(value, this.mentoringId)
        } else if (key == "task") {
            return new MentoringTask(value, this.mentoringId)
        }
    }

    private getDataFromMethod(fn: Function) {
        if (this.planObject === null) {
            return null
        }
        return _.mapValues(this.planObjClasses, fn)
    }

    update(newPlan: any) {
        const additionalClass = _.mapValues(newPlan, (value, key) => {
            if (this.planObjClasses?.[key]) {
                return this.planObjClasses[key]?.update(value)
            }
            return this.createClassFromKey(undefined, key)?.update(value)
        })
        Object.assign(this.planObjClasses, additionalClass)
    }

    replace(newPlan: any) {
        const additionalClass = _.mapValues(newPlan, (value, key) => {
            if (this.planObjClasses?.[key]) {
                return this.planObjClasses[key]?.replace(value)
            }
            return this.createClassFromKey(undefined, key)?.replace(value)
        })
        Object.assign(this.planObjClasses, additionalClass)
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

    getAllFileName() {
        const fileArrayRaw = _.reduce(this.planObjClasses, (result: any, value) => {
            return _.concat(result, value.getAllFileName() ?? [])
        }, [])
        return <string[]><any>_.compact(_.uniq(fileArrayRaw))
    }

    async checkFiles() {
        await MentoringFile.checkFiles(this.planObjClasses)
    }

    async deleteUnusedFiles() {
        this.mentoringFile.deleteExcept(this.getAllFileName())
    }
}