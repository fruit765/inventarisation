import _ from "lodash"

/**
 * Класс отвечает за тест в системе наставнечества
 * @class
 */
export default class MentoringTest {

    private testObject
    private mentoringId: number

    constructor(testObject: any, mentoringId: number) {
        this.mentoringId = mentoringId
        this.testObject = testObject
        if (this.testObject) {
            if (!this.testObject.status) {
                this.testObject.status = "incomplete"
            }
        }
    }

    get() {
        return this.testObject
    }

    getWithFilePath() {
        const testObject = _.cloneDeep(this.testObject)
        if (testObject?.img) {
            testObject.img = `uploaded/mentoring/${this.mentoringId}/${testObject.img}`
        }
        _.forEach(testObject?.questions, value => {
            if (value?.img) {
                value.img = `uploaded/mentoring/${this.mentoringId}/${value.img}`
            }
        })
        return testObject
    }

    getAllFileName() {
        const questionImg = [this.testObject?.img]
        const answerImg = this.testObject?.questions.map((question: { img: string }) => {
            return question?.img
        })
        const allFileArrRaw = _.concat(questionImg, answerImg)
        return _.compact(allFileArrRaw)
    }
}

