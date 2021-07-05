import _ from "lodash"
import MentoringBase from "./MentoringBase"
import MentoringFile from "./MentoringFile"

/**
 * Класс отвечает за задания в системе наставнечества
 * @class
 */
export default class MentoringTask extends MentoringBase {

    private mentoringFile


    constructor(dataObject: any, mentoringId: number) {
        super(dataObject, mentoringId)
        this.mentoringFile = new MentoringFile(mentoringId)
        
    }

    protected init(dataObject: any) {
        super.init(dataObject)
        if (this.dataObject) {
            if (!this.dataObject.status) {
                this.dataObject.status = "incomplete"
            }
            if (this.dataObject?.grade) {
                this.grade()
            }
            if (this.dataObject?.checking && this.dataObject?.status === "incomplete") {
                this.dataObject.status = "checking"
            } else {
                delete (this.dataObject.checking)
            }
        }
    }

    private grade() {
        if (this.dataObject.grade > 100 && this.dataObject.grade < 0) {
            throw this.createErr.mentoringGradeRange()
        }
        if (this.dataObject.status === "checking") {
            this.dataObject.status = "complete"
        } else {
            delete (this.dataObject.grade)
        } 
    }

    async checkFiles() {
        if (this.dataObject?.file) {
            this.dataObject.file = await this.mentoringFile.checkFile(this.dataObject.file)
        }

        if (this.dataObject?.answer?.file) {
            this.dataObject.answer.file = await this.mentoringFile.checkFile(this.dataObject.answer.file)
        }
    }

    get() {
        return this.dataObject
    }

    getWithFilePath() {
        const dataObject = _.cloneDeep(this.dataObject)
        if (dataObject?.file) {
            dataObject.file = this.mentoringFile.path(dataObject.file)
        }

        if (dataObject?.answer?.file) {
            dataObject.answer.file = this.mentoringFile.path(dataObject.answer.file)
        }

        return dataObject
    }

    getAllFileName() {
        const allFile = [this.dataObject?.answer?.file, this.dataObject?.file]
        return _.compact(allFile)
    }
}