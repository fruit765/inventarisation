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

    update(newData: any) {
        if (newData.reset) {
            if(this.dataObject.status === "complete") {
                this.reset()
                return void 0
            } else {
                delete newData.reset
            }
        }

        if (newData.setStartTest) {
            this.startTimer()
            delete (newData.setStartTest)
        }

        if (this.dataObject.status === "incomplete") {
            this.updateIncomplete(newData)
        }

        if (this.dataObject.status === "complete") {
            this.updateComplete(newData)
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

    private reset() {
        delete this.dataObject.startTime
        delete this.dataObject.leftTime
        delete this.dataObject.grade
        this.dataObject?.questions?.forEach?.((question: any) => {
            question?.answers?.forEach?.((answer: any) => {
                delete(answer?.isPick)
            })
        })
        this.dataObject.status = "incomplete"

    }

    private startTimer() {
        if (!this.dataObject.startTime) {
            this.dataObject.startTime = dayjs().valueOf()
        }
    }

    private updateIncomplete(newData: any) {
        if (this.timeLeftStamp()) {
            return void 0
        }

        this.replaceDataObject(_.merge({}, this.dataObject, newData))

        if (this.isAllAnswered()) {
            this.dataObject.status = "complete"
        }

    }

    private updateComplete(newData: any) {
        if (!this.dataObject.grade) {
            this.grade()
        }
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
        if (test.questions === test.isPicks) {
            return true
        } else {
            return false
        }
    }

    private checkAnswer() {
        return _.reduce(this.dataObject?.questions, (accumulator, question) => {
            return this.checkQuestion(question?.answers, accumulator)
        }, { right: 0, questions: 0, isPicks: 0, isRight: 0 })
    }

    private timeLeftStamp() {
        if (this.dataObject.duration && this.dataObject.status === "incomplete" && this.dataObject.startTime) {
            const leftTimeRawMilisecond = this.dataObject.duration * 60000 - (dayjs().valueOf() - this.dataObject.startTime)
            const leftTimeSecond = Math.ceil(leftTimeRawMilisecond / 1000)
            this.dataObject.leftTime = leftTimeSecond * 1000
            if (this.dataObject.leftTime <= 0) {
                this.dataObject.leftTime = 0
                this.dataObject.status = "complete"
                return true
            }
        }
        return false

    }

    private checkQuestion(answers: any, accumulator: { right: number, questions: number, isPicks: number, isRight: number }) {
        accumulator.questions++
        let isPicks = 0
        let isRight = 0
        let right = 0
        for (let answer of answers ?? []) {
            if (answer?.isPick) {
                isPicks++
            }
            if (answer?.isRight) {
                isRight++
            }
            if (answer?.isRight && answer.isRight === answer?.isPick) {
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
        accumulator.right += right
        accumulator.isPicks += isPicks
        return accumulator
    }

    isNeedWriteDB() {
        return this.timeLeftStamp()
    }

    isComplete() {
        return this.dataObject.status === "complete"
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

        test?.questions?.forEach?.((question: any) => {
            question?.answers?.forEach?.((answer: any) => {
                if (answer.isRight != null && !(test.status === "complete" && answer.isPick)) {
                    delete (answer.isRight)
                }
            })
        })

        return test
    }
}

