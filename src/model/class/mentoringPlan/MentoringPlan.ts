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

    constructor(planObject: any, mentoringId: number) {
        this.planObject = planObject
        this.planObjClasses = _.mapValues(planObject, (value, key) => {
            if (key === "blocks") {
                return new MentoringBlocks(value, mentoringId)
            } else if (key === "test") {
                return new MentoringTest(value, mentoringId)
            } else if (key == "task") {
                return new MentoringTask(value, mentoringId)
            }
        })
        this.mentoringFile = new MentoringFile(mentoringId)
    }

    private getDataFromMethod(fn: Function) {
        if (this.planObject === null) {
            return null
        }
        return _.mapValues(this.planObjClasses, fn)
    }

    update(newPlan: any) {
        this.planObjClasses = _.mapValues(newPlan, (value, key) => {
            if(this.planObjClasses?.[key]) {
                this.planObjClasses[key]?.update?.(value) ||
            }
            if (key === "blocks") {
                if(this.planObjClasses?.[key]) {
                    this.planObjClasses?.[key]
                }
                return new MentoringBlocks(value, mentoringId)
            } else if (key === "test") {
                return new MentoringTest(value, mentoringId)
            } else if (key == "task") {
                return new MentoringTask(value, mentoringId)
            }
        })
        this.getDataFromMethod((value: any) => value?.update())
    }

    replace(newPlan: any) {

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