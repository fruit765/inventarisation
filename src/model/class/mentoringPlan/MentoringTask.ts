import _ from "lodash"
import CreateErr from "../createErr"
/**
 * Класс отвечает за задания в системе наставнечества
 * @class
 */
export default class MentoringTask {

    private taskObject
    private mentoringId: number
    private createErr: CreateErr

    constructor(taskObject: any, mentoringId: number) {
        this.createErr = new CreateErr()
        this.mentoringId = mentoringId
        this.taskObject = taskObject
        if (this.taskObject) {
            if (!this.taskObject.status) {
                this.taskObject.status = "incomplete"
            }
        }
    }

    checkFile(path: string) {
        const fileName = path.match(/[^/]*$/gi)?.[0]
        if (fileName) {
            throw this.createErr.incorrectFileName(fileName)
        }
        return fileName

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