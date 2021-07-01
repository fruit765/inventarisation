import _ from "lodash"
import createErr from "../createErr"
import MentoringFile from "./MentoringFile"

/**
 * Класс отвечает за тест в системе наставнечества
 * @class
 */
export default class MentoringTest {

    private testObject
    private mentoringId: number
    private mentoringFile
    private createErr

    constructor(testObject: any, mentoringId: number) {
        this.mentoringId = mentoringId
        this.testObject = testObject
        this.createErr = new createErr()
        this.mentoringFile = new MentoringFile(mentoringId)
        if (this.testObject) {
            if (this.testObject.status == "incomplete") {
                this.checkAnswer()
            }
            if (!this.testObject.status) {
                this.testObject.status = "incomplete"
            }
        }
    }

    private checkAnswer() {
        const test = _.reduce(this.testObject?.questions, (accumulator, question) => {
            return this.checkQuestion(question?.answers, accumulator)
        }, { right: 0, questions: 0, protegeСhoices: 0, isRight: 0 })

        if (test.protegeСhoices) {
            if (test.protegeСhoices !== test.questions) {
                throw this.createErr.mentoringAllQuestionsNeedToBeAnswered()
            }
            this.testObject.grade = Math.round((100 / test.questions) * test.right)
            this.testObject.status = "complete"
        }

    }

    private checkQuestion(answers: any, accumulator: { right: number, questions: number, protegeСhoices: number, isRight: number }) {
        accumulator.questions++
        let protegeСhoices = 0
        let isRight = 0
        let right = 0
        for (let answer of answers ?? []) {
            if (answer?.protegeСhoice) {
                protegeСhoices++
            }
            if (answer?.isRight) {
                isRight++
            }
            if (answer?.isRight !== undefined && answer.isRight === answer?.protegeСhoice) {
                right++
            }
        }
        if (isRight) {
            accumulator.isRight += isRight
        } else {
            throw this.createErr.mentoringRequiredAtLeastOneCorrectAnswer()
        }
        if (isRight > 1) {
            right /= isRight
        }
        accumulator.right = right
        accumulator.protegeСhoices = protegeСhoices
        return accumulator
    }


    async checkFiles() {
        if (this.testObject?.img) {
            this.testObject.img = await this.mentoringFile.checkFile(this.testObject.img)
            await this.mentoringFile.checkForImgExt(this.testObject.img)
        }

        for (let value of this.testObject?.questions ?? []) {
            if (value?.img) {
                value.img = await this.mentoringFile.checkFile(value.img)
                await this.mentoringFile.checkForImgExt(value.img)
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

    getProtege() {
        const test = this.getWithFilePath()
        test?.questions?.forEach?.((question: { isRight?: number, protegeСhoices?: number }) => {
            if (question.isRight && (test.status !== "complete" || !question.protegeСhoices)) {
                delete (question.isRight)
            }
        })

        return test
    }
}

