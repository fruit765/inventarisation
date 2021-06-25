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

    getAllFileName() {
        const fileArrayRaw = _.reduce(this.planObjClasses, (result: any, value) => {
            return _.concat(result, value.getAllFileName() ?? [])
        }, [])
        return _.compact(_.uniq(fileArrayRaw))
    }

    

    async checkFiles() {
        await MentoringFile.checkFiles(this.planObjClasses)
    }

    // async deleteUnusedFiles(mentoringId: number) {
    //     files = await readdir(path)
    //     this.getAllFileName()
    // }
}