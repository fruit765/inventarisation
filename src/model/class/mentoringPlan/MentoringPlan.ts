import _ from "lodash"
import MentoringTest from "./MentoringTest"
import MentoringTask from "./MentoringTask"
import MentoringBlock from "./MentoringBlock"

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
                return _.map(value, (block) => new MentoringBlock(block))
            } else if (key === "test") {
                return new MentoringTest(value)
            } else if (key == "task") {
                return new MentoringTask(value)
            }
        })
    }

    get() {
        return _.mapValues(this.planObjClasses, (value, key) => {
            if (_.isArray(value)) {
                return value.map(x => x.get())
            } else {
                return value.get()
            }
        })
    }

    getAllFileName() {
        return 
    }
}