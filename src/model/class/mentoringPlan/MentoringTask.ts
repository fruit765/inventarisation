import _ from "lodash"
/**
 * Класс отвечает за задания в системе наставнечества
 * @class
 */
export default class MentoringTask {

    private taskObject

    constructor(taskObject: any) {
        this.taskObject = taskObject
        if (this.taskObject) {
            if (!this.taskObject.status) {
                this.taskObject.status = "incomplete"
            }
        }
    }

    get() {
        return this.taskObject
    }

    getAllFileName() {
        const allFile =  [this.taskObject?.answer?.file, this.taskObject?.file]
        return _.compact(allFile)
    }
}