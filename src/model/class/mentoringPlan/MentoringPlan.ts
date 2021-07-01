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

    getDataFromMethod(fn: Function) {
        if (this.planObject === null) {
            return null
        }
        return _.mapValues(this.planObjClasses, value => value.get())
    }

    get() {
        if (this.planObject === null) {
            return null
        }
        return _.mapValues(this.planObjClasses, value => value.get())
    }

    getWithFilePath() {
        if (this.planObject === null) {
            return null
        }
        return _.mapValues(this.planObjClasses, value => value?.getWithFilePath?.() || value.get())
    }

    getProtege() {
        if (this.planObject === null) {
            return null
        }
        return _.mapValues(this.planObjClasses, value => this?.getProtege?.() || value?.getWithFilePath?.() || value.get())
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