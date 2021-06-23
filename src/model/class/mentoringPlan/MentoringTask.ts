/**
 * Класс отвечает за задания в системе наставнечества
 * @class
 */
export default class MentoringTask {

    private taskObject

    constructor(taskObject: any) {
        this.taskObject = taskObject
    }

    get() {
        return this.taskObject
    }

    getAllFileName() {
        const questionImg = this.taskObject?.img ?? []
        const answerImg = 
    }
}