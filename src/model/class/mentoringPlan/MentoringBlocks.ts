import MentoringBaseIteration from "./MentoringBaseIteration"
import MentoringBlock from "./MentoringBlock"

/**
 * Класс отвечает за блоки в плане в системе наставнечества
 * @class
 */
export default class MentoringBlocks extends MentoringBaseIteration {

    protected createClassFromKey(value: any, key: string) {
        return new MentoringBlock(value, this.mentoringId)
    }
}