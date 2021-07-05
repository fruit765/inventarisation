import dayjs from "dayjs"
import _ from "lodash"
import MentoringBase from "./MentoringBase"
import MentoringFile from "./MentoringFile"

/**
 * Класс отвечает за тест в системе наставнечества
 * @class
 */
export default class MentoringTest extends MentoringBase {

    private mentoringFile: any

    constructor(dataObject: any, mentoringId: number) {
        super(dataObject, mentoringId)
        this.mentoringFile = new MentoringFile(this.mentoringId)

    }

    protected init(dataObject: any) {
        super.init(dataObject)

        if (this.dataObject && !this.dataObject.status) {
            this.dataObject.status = "incomplete"
        }

    }

    update(newData: any) {
        if (this.dataObject.duration && this.dataObject.status === "incomplete") {
            this.timeLeftStamp()
        }
        if (this.dataObject.setStartTest) {
            delete (this.dataObject.setStartTest)
        }

        if (this.dataObject.status === "incomplete") {
            _.merge(this.dataObject, newData)
            if(this.isAllAnswered()) {
                this.dataObject.status = "complete"
            }
        }

        if (this.dataObject.status === "complete" && !this.dataObject.grade) {
            this.dataObject.grade = this.gradeTest()
        }
    }

    private gradeTest() {
        const test = this.checkAnswer()
        this.dataObject.grade = Math.round((100 / test.questions) * test.right)
    }

    private isAllAnswered() {
        const test = this.checkAnswer()
        if (test.questions === test.protegeСhoices) {
            return true
        } else {
            return false
        }
    }

    private checkAnswer() {
        return _.reduce(this.dataObject?.questions, (accumulator, question) => {
            return this.checkQuestion(question?.answers, accumulator)
        }, { right: 0, questions: 0, protegeСhoices: 0, isRight: 0 })
    }

    timeLeftStamp() {
        if (this.dataObject.setStartTest && !this.dataObject.startTime) {
            this.dataObject.startTime = dayjs().valueOf()
        }

        if (!this.dataObject.setStartTest && !this.dataObject.startTime) {
            throw this.createErr.mentoringNeedStartTest()
        }

        this.dataObject.leftTime = this.dataObject.duration * 60000 - (dayjs().valueOf() - this.dataObject.startTime)
        if (this.dataObject.leftTime <= 0) {
            this.dataObject.leftTime = 0
            this.dataObject.status = "complete"
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
        if (this.dataObject?.img) {
            this.dataObject.img = await this.mentoringFile.checkFile(this.dataObject.img)
            await this.mentoringFile.checkForImgExt(this.dataObject.img)
        }

        for (let value of this.dataObject?.questions ?? []) {
            if (value?.img) {
                value.img = await this.mentoringFile.checkFile(value.img)
                await this.mentoringFile.checkForImgExt(value.img)
            }
        }
    }

    get() {
        return this.dataObject
    }

    getWithFilePath() {
        const dataObject = _.cloneDeep(this.dataObject)
        if (dataObject?.img) {
            dataObject.img = this.mentoringFile.path(dataObject.img)
        }
        _.forEach(dataObject?.questions, value => {
            if (value?.img) {
                value.img = this.mentoringFile.path(value.img)
            }
        })
        return dataObject
    }

    getAllFileName() {
        const questionImg = [this.dataObject?.img]
        const answerImg = this.dataObject?.questions?.map((question: { img: string }) => {
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

