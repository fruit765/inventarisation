import _ from "lodash"
import MentoringBlock from "./MentoringBlock"

/**
 * Класс отвечает за блоки в плане в системе наставнечества
 * @class
 */
export default class MentoringBlocks {

    private blocksObject
    private blocksObjClasses: any

    constructor(blocksObject: any) {
        this.blocksObject = blocksObject
        this.blocksObjClasses = _.map(blocksObject, value => new MentoringBlock(value))
    }

    get() {
        return _.map(this.blocksObjClasses, value => value.get())
    }

    getAllFileName() {
        return _.reduce(this.blocksObjClasses, (result: any, value) => {
            return _.concat(result, value.getAllFileName() ?? [])
        }, [])
    }
}