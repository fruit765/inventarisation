import _ from "lodash"
import MentoringTest from "./MentoringTest"
import MentoringTask from "./MentoringTask"
import MentoringBlocks from "./MentoringBlocks"

/**
 * Класс отвечает за план в системе наставнечества
 * @class
 */
export default class MentoringPlan {

    private planObject
    private planObjClasses: any

    constructor(planObject: any) {
        this.planObject = planObject
        this.planObjClasses = _.mapValues(planObject, (value, key) => {
            if (key === "blocks") {
                return new MentoringBlocks(value)
            } else if (key === "test") {
                return new MentoringTest(value)
            } else if (key == "task") {
                return new MentoringTask(value)
            }
        })
    }

    get() {
        return _.mapValues(this.planObjClasses, value => value.get())
    }

    getAllFileName() {
        const fileArrayRaw = _.reduce(this.planObjClasses, (result: any, value) => {
            return _.concat(result, value.getAllFileName() ?? [])
        }, [])
        return _.compact(_.uniq(fileArrayRaw))
    }
}