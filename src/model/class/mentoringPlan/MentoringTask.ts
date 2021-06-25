import _ from "lodash"
import MentoringFile from "./MentoringFile"

/**
 * Класс отвечает за задания в системе наставнечества
 * @class
 */
export default class MentoringTask {

    private taskObject
    private mentoringId: number
    private mentoringFile


    constructor(taskObject: any, mentoringId: number) {
        this.mentoringFile = new MentoringFile(mentoringId)
        this.mentoringId = mentoringId
        this.taskObject = taskObject
        if (this.taskObject) {
            if (!this.taskObject.status) {
                this.taskObject.status = "incomplete"
            }
            if(this.taskObject.status === "checking" && this.taskObject?.grade) {
                this.taskObject.status = "complete"
            } else if (this.taskObject?.grade) {
                
            }
        }
    }

    refPrepare() {
        if (this.taskObject?.file) {
            this.taskObject.file = this.taskObject.file.match(/[^/]*$/gi)[0]
        }

        if (this.taskObject?.answer?.file) {
            this.taskObject.answer.file = this.taskObject.answer.file.match(/[^/]*$/gi)[0]
        }
    }

    get() {
        return this.taskObject
    }

    getWithFilePath() {
        const taskObject = _.cloneDeep(this.taskObject)
        if (taskObject?.file) {
            taskObject.file = `uploaded/mentoring/${this.mentoringId}/${taskObject.file}`
        }

        if (taskObject?.answer?.file) {
            taskObject.answer.file = `uploaded/mentoring/${this.mentoringId}/${taskObject.answer.file}`
        }

        return taskObject
    }

    getAllFileName() {
        const allFile = [this.taskObject?.answer?.file, this.taskObject?.file]
        return _.compact(allFile)
    }
}