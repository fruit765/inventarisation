import _ from "lodash"
import MentoringTask from "./MentoringTask"
import MentoringTest from "./MentoringTest"
/**
 * Класс отвечает за один блок в плане в системе наставнечества
 * @class
 */
export default class MentoringBlock {

    private blockObject
    private blockObjClasses: any

    constructor(blockObject: any) {
        this.blockObject = blockObject
        this.blockObjClasses = _.mapValues(blockObject, (value, key) => {
            if (key === "sections" || key === "title") {
                return { get: () => value }
            } else if (key === "test") {
                return new MentoringTest(value)
            } else if (key == "task") {
                return new MentoringTask(value)
            }
        })
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

    getAllFileName() {
        return _.reduce(this.blockObjClasses, (result: any[], value) => {
            return _.concat(result, value?.getAllFileName?.() ?? [])
        }, [])
    }
}