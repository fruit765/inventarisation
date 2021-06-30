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
                const test = _.transform(this.testObject?.questions, (accumulator, question) => {
                    accumulator.questions++
                    for (let answer of question?.answers ?? []) {
                        if (answer?.isRight !== undefined && answer.isRight === answer?.protegeСhoice) {
                            accumulator.right++
                            accumulator.protegeСhoices++
                            break
                        } else if (answer.protegeСhoice) {
                            accumulator.protegeСhoices++
                            break
                        }
                    }
                }, { right: 0, questions: 0, protegeСhoices: 0 })

                if (test.protegeСhoices) {
                    if (test.protegeСhoices !== test.questions) {
                        throw this.createErr.allQuestionsNeedToBeAnswered()
                    }

                    this.testObject.grade = Math.round((100 / test.questions) * test.right)
                }
                if (!this.testObject.status) {
                    this.testObject.status = "incomplete"
                }
            }
        }
    }

    checkAnswer()

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
}

