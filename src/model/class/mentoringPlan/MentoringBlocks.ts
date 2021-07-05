import _ from "lodash"
import MentoringBase from "./MentoringBase"
import MentoringBlock from "./MentoringBlock"
import MentoringFile from "./MentoringFile"

/**
 * Класс отвечает за блоки в плане в системе наставнечества
 * @class
 */
export default class MentoringBlocks  extends MentoringBase{

    private blocksObjClasses: any

    constructor(dataObject: any, mentoringId: number) {
        super(dataObject, mentoringId)
    }

    protected init(dataObject: any) {
        super.init(dataObject)
        this.blocksObjClasses = _.map(this.dataObject, value => new MentoringBlock(value, this.mentoringId))
    }

    async checkFiles() {
        await MentoringFile.checkFiles(this.blocksObjClasses)
    }

    get() {
        return _.map(this.blocksObjClasses, value => value.get())
    }

    getWithFilePath() {
        return _.map(this.blocksObjClasses, value => value.getWithFilePath() || value.get())
    }

    getAllFileName() {
        return _.reduce(this.blocksObjClasses, (result: any, value) => {
            return _.concat(result, value.getAllFileName() ?? [])
        }, [])
    }
}