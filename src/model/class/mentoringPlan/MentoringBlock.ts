import _ from "lodash"
import MentoringBase from "./MentoringBase"
import MentoringFile from "./MentoringFile"
import MentoringTask from "./MentoringTask"
import MentoringTest from "./MentoringTest"
/**
 * Класс отвечает за один блок в плане в системе наставнечества
 * @class
 */
export default class MentoringBlock extends MentoringBase {

    private blockObjClasses: any

    protected init(dataObject: any) {
        super.init(dataObject)
        this.blockObjClasses = _.mapValues(dataObject, (value, key) => {
            if (key === "sections" || key === "title") {
                return { get: () => value }
            } else if (key === "test") {
                return new MentoringTest(value, this.mentoringId)
            } else if (key == "task") {
                return new MentoringTask(value, this.mentoringId)
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