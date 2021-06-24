import _ from "lodash"

/**
 * Класс отвечает за тест в системе наставнечества
 * @class
 */
export default class MentoringTest {

    private testObject

    constructor(testObject: any) {
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

    getAllFileName() {
        const questionImg = [this.testObject?.img]
        const answerImg =  this.testObject?.questions.map((question: { img: string }) => {
            return question?.img
        })
        const allFileArrRaw = _.concat(questionImg, answerImg)
        return _.compact(allFileArrRaw)
    }
}

