import _ from "lodash"
import MentoringTest from "./MentoringTest"
import MentoringTask from "./MentoringTask"
import MentoringFile from "./MentoringFile"
import MentoringBaseIteration from "./MentoringBaseIteration"
import MentoringBase from "./MentoringBase"
import MentoringBlocks from "./MentoringBlocks"
import { mapArrayOrObject } from "../../libs/objectOp"

/**
 * Класс отвечает за план в системе наставнечества
 * @class
 */
export default class MentoringPlan extends MentoringBaseIteration {

    private mentoringFile

    constructor(dataObject: any, mentoringId: number) {
        super(dataObject, mentoringId)
        this.mentoringFile = new MentoringFile(mentoringId)
    }

    protected createClassFromKey(value: any, key: string) {
        if (key === "blocks") {
            return new MentoringBlocks(value, this.mentoringId)
        } else if (key === "test") {
            return new MentoringTest(value, this.mentoringId)
        } else if (key == "task") {
            return new MentoringTask(value, this.mentoringId)
        } else {
            return new MentoringBase(value, this.mentoringId)
        }
    }
    
    async deleteUnusedFiles() {
        this.mentoringFile.deleteExcept(this.getAllFileName())
    }
}