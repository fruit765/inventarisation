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
        return
    }
}

