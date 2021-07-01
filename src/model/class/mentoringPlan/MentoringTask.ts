import _ from "lodash"
import createErr from "../createErr"
import MentoringFile from "./MentoringFile"

/**
 * Класс отвечает за задания в системе наставнечества
 * @class
 */
export default class MentoringTask {

    private taskObject
    private mentoringId: number
    private mentoringFile
    private createErr


    constructor(taskObject: any, mentoringId: number) {
        this.mentoringFile = new MentoringFile(mentoringId)
        this.mentoringId = mentoringId
        this.taskObject = taskObject
        this.createErr = new createErr()
        if (this.taskObject) {
            if (!this.taskObject.status) {
                this.taskObject.status = "incomplete"
            }
            if (this.taskObject?.grade) {
                this.grade()
            }
            if (this.taskObject?.checking && this.taskObject?.status === "incomplete") {
                this.taskObject.status = "checking"
            } else {
                delete (this.taskObject.checking)
            }
        }
    }

    private grade() {
        if (this.taskObject.grade > 100 && this.taskObject.grade < 0) {
            throw this.createErr.mentoringGradeRange()
        }
        if (this.taskObject.status === "checking") {
            this.taskObject.status = "complete"
        } else {
            delete (this.taskObject.grade)
        } 
    }

    async checkFiles() {
        if (this.taskObject?.file) {
            this.taskObject.file = await this.mentoringFile.checkFile(this.taskObject.file)
        }

        if (this.taskObject?.answer?.file) {
            this.taskObject.answer.file = await this.mentoringFile.checkFile(this.taskObject.answer.file)
        }
    }

    get() {
        return this.taskObject
    }

    getWithFilePath() {
        const taskObject = _.cloneDeep(this.taskObject)
        if (taskObject?.file) {
            taskObject.file = this.mentoringFile.path(taskObject.file)
        }

        if (taskObject?.answer?.file) {
            taskObject.answer.file = this.mentoringFile.path(taskObject.answer.file)
        }

        return taskObject
    }

    getAllFileName() {
        const allFile = [this.taskObject?.answer?.file, this.taskObject?.file]
        return _.compact(allFile)
    }
}