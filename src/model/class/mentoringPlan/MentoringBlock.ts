import _ from "lodash"
import MentoringBase from "./MentoringBase"

import MentoringBaseIteration from "./MentoringBaseIteration"
import MentoringBlocks from "./MentoringBlocks"
import MentoringTask from "./MentoringTask"
import MentoringTest from "./MentoringTest"
/**
 * Класс отвечает за один блок в плане в системе наставнечества
 * @class
 */
export default class MentoringBlock extends MentoringBaseIteration {

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
}