import dayjs from "dayjs"
import _ from "lodash"
import MentoringBase from "./MentoringBase"
import MentoringFile from "./MentoringFile"

/**
 * Класс отвечает за тест в системе наставнечества
 * @class
 */
export default class MentoringTest extends MentoringBase {

    private mentoringFile

    constructor(dataObject: any, mentoringId: number) {
        super(dataObject, mentoringId)
        this.mentoringFile = new MentoringFile(this.mentoringId)

    }

    protected replaceDataObject(dataObject: any) {
        super.replaceDataObject(dataObject)



    }

    update(newData: any) {

        if (this.dataObject.setStartTest) {
            if (!this.dataObject.startTime) {
                this.dataObject.startTime = dayjs().valueOf()
            }
            delete (this.dataObject.setStartTest)
        }

        this.timeLeftStamp()
        console.log(this.dataObject)
        if (this.dataObject.status === "incomplete") {
            _.merge(this.dataObject, newData)
            if (this.isAllAnswered()) {
                this.dataObject.status = "complete"
            }
        }

        if (this.dataObject.status === "complete" && !this.dataObject.grade) {
            this.dataObject.grade = this.grade()
        }
    }
    


    replace(newData: any) {
        if (newData && !newData.status) {
            newData.status = "incomplete"
        }

        this.mapImg(newData, (img: any) => {
            this.mentoringFile.checkForImgExt(img)
            this.mentoringFile.checkPath(img)
            return this.mentoringFile.cutPath(img)
        })

        this.replaceDataObject(newData)
    }

    private mapImg(testObject: any, fn: Function) {
        if (testObject?.img) {
            testObject.img = fn(testObject.img)
        }

        for (let value of testObject?.questions ?? []) {
            if (value?.img) {
                value.img = fn(value.img)
            }
        }
        return testObject
    }

    private grade() {
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

    private timeLeftStamp() {
        if (this.dataObject.duration && this.dataObject.status === "incomplete" && this.dataObject.startTime) {
            this.dataObject.leftTime = this.dataObject.duration * 60000 - (dayjs().valueOf() - this.dataObject.startTime)
            if (this.dataObject.leftTime <= 0) {
                this.dataObject.leftTime = 0
                this.dataObject.status = "complete"
                return true
            }
        }
        return false

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

    isNeedWriteDB() {
        return this.timeLeftStamp()
    }

    async checkFiles() {
        if (this.dataObject?.img) {
            this.dataObject.img = await this.mentoringFile.checkFile(this.dataObject.img)
        }

        for (let value of this.dataObject?.questions ?? []) {
            if (value?.img) {
                value.img = await this.mentoringFile.checkFile(value.img)
            }
        }
    }

    getWithFilePath() {
        const dataObject = _.cloneDeep(this.get())
        return this.mapImg(dataObject, (img: string) => {
            return this.mentoringFile.path(img)
        })
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
        if (test.status === "incomplete" && !test.startTime) {
            delete (test.questions)
        }
        test?.questions?.forEach?.((question: { isRight?: number, protegeСhoices?: number }) => {
            if (question.isRight && (test.status !== "complete" || !question.protegeСhoices)) {
                delete (question.isRight)
            }
        })

        return test
    }
}

