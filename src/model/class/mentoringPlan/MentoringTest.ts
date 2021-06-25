import _ from "lodash"
import MentoringFile from "./MentoringFile"

/**
 * Класс отвечает за тест в системе наставнечества
 * @class
 */
export default class MentoringTest {

    private testObject
    private mentoringId: number
    private mentoringFile

    constructor(testObject: any, mentoringId: number) {
        this.mentoringId = mentoringId
        this.testObject = testObject
        this.mentoringFile = new MentoringFile(mentoringId)
        if (this.testObject) {
            if (!this.testObject.status) {
                this.testObject.status = "incomplete"
            }
        }
    }

    async checkFiles() {
        if (this.testObject?.img) {
            this.testObject.img = await this.mentoringFile.checkFile(this.testObject.img)
        }

        for (let value of this.testObject?.questions ?? []) {
            if (value?.img) {
                value.img = await this.mentoringFile.checkFile(value.img)
            }
        }
    }

    get() {
        return this.testObject
    }

    getWithFilePath() {
        const testObject = _.cloneDeep(this.testObject)
        if (testObject?.img) {
            testObject.img = this.mentoringFile.path(testObject.img)
        }
        _.forEach(testObject?.questions, value => {
            if (value?.img) {
                value.img = this.mentoringFile.path(value.img)
            }
        })
        return testObject
    }

    getAllFileName() {
        const questionImg = [this.testObject?.img]
        const answerImg = this.testObject?.questions?.map((question: { img: string }) => {
            return question?.img
        })
        const allFileArrRaw = _.concat(questionImg, answerImg)
        return _.compact(allFileArrRaw)
    }
}

