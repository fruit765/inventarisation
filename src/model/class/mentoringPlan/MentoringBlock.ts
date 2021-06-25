import _ from "lodash"
import MentoringFile from "./MentoringFile"
import MentoringTask from "./MentoringTask"
import MentoringTest from "./MentoringTest"
/**
 * Класс отвечает за один блок в плане в системе наставнечества
 * @class
 */
export default class MentoringBlock {

    private blockObject
    private blockObjClasses: any

    constructor(blockObject: any, mentoringId: number) {
        this.blockObject = blockObject
        this.blockObjClasses = _.mapValues(blockObject, (value, key) => {
            if (key === "sections" || key === "title") {
                return { get: () => value }
            } else if (key === "test") {
                return new MentoringTest(value, mentoringId)
            } else if (key == "task") {
                return new MentoringTask(value, mentoringId)
            }
        })
    }

    async checkFiles() {
        await MentoringFile.checkFiles(this.blockObjClasses)
    }

    get() {
        return _.mapValues(this.blockObjClasses, (value, key) => {
            if (_.isArray(value)) {
                return value.map(x => x.get())
            } else {
                return value.get()
            }
        })
    }

    getWithFilePath() {
        return _.mapValues(this.blockObjClasses, value => value?.getWithFilePath?.() || value.get())
    }

    getAllFileName() {
        return _.reduce(this.blockObjClasses, (result: any[], value) => {
            return _.concat(result, value?.getAllFileName?.() ?? [])
        }, [])
    }
}