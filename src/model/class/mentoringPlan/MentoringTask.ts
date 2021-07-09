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

    protected replaceDataObject(dataObject: any) {
        super.replaceDataObject(dataObject)
    }

    replace(newData: any) {
        if (newData && !newData.status) {
            newData.status = "incomplete"
        }

        this.mapFiles(newData, (img: any) => {
            this.mentoringFile.checkPath(img)
            return this.mentoringFile.cutPath(img)
        })

        this.replaceDataObject(newData)


    }

    update(newData: any) {

        this.mapFiles(newData, (img: any) => {
            this.mentoringFile.checkPath(img)
            return this.mentoringFile.cutPath(img)
        })

        this.replaceDataObject(newData)

        if (this.dataObject?.checking && this.dataObject?.status === "incomplete") {
            this.dataObject.status = "checking"
        } 
        if (this.dataObject?.checking) {
            delete (this.dataObject.checking)
        }

        if (this.dataObject?.grade) {
            this.grade()
        }
    }

    private mapFiles(taskObj: any, fn: Function) {
        if (taskObj?.file) {
            taskObj.file = fn(taskObj.file)
        }

        if (taskObj?.answer?.file) {
            taskObj.answer.file = fn(taskObj.answer.file)
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

    isComplete() {
        return this.dataObject.status === "complete"
    }

    async checkFiles() {
        if (this.dataObject?.file) {
            this.dataObject.file = await this.mentoringFile.checkFile(this.dataObject.file)
        }

        if (this.dataObject?.answer?.file) {
            this.dataObject.answer.file = await this.mentoringFile.checkFile(this.dataObject.answer.file)
        }
    }

    getWithFilePath() {
        const dataObject = _.cloneDeep(this.dataObject)
        return this.mapFiles(dataObject, (file: string) => {
            return this.mentoringFile.path(file)
        })
    }

    getAllFileName() {
        const allFile = [this.dataObject?.answer?.file, this.dataObject?.file]
        return _.compact(allFile)
    }
}