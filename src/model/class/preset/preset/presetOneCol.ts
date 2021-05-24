import _ from "lodash"
import { delUndefinedDeep } from "../../../libs/objectOp"
import PresetSubCol from "./presetSubCol"

export default class PresetOneCol {
    private new: any
    private old: any
    private newClass: PresetSubCol
    private oldClass: PresetSubCol

    constructor(preset: {new?: any, old?: any}) {

        this.new = {}
        this.old = {}

        const presetWithoutUnd = delUndefinedDeep(preset)
        const isNewOldEmpty = !(preset.new && preset.old)
        const isGlobalObjEmpty = _.isEmpty(presetWithoutUnd)
        
        if (isNewOldEmpty && isGlobalObjEmpty) {
            this.new = { logic: "false" }
        } else if(isNewOldEmpty) {
            this.new = presetWithoutUnd
            this.old = { logic: "true" }
        } else {
            this.new = preset.new ?? { logic: "true" }
            this.old = preset.old ?? { logic: "true" }
        }

        this.newClass = new PresetSubCol(this.new)
        this.oldClass = new PresetSubCol(this.old)
    }

    /**Проверяет значение на соответствие пресету
     * Первое значение в массиве относится к новым данным Второе к старым*/
    async match(data: Array<any>) {
        const [newData, oldData] = data
        const res = await this.newClass.match(newData) && await this.oldClass.match(oldData)
        return res
    }
}