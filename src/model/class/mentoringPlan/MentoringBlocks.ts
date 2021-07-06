import _ from "lodash"
import { mapArrayOrObject } from "../../libs/objectOp"
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

    replace(newPlan: any) {
        const additionalClass = mapArrayOrObject(newPlan, (value, key) => {
            if (this.objectClasses?.[key]) {
                const existingClass = this.objectClasses[key]
                existingClass?.replace?.(value)
                return existingClass
            } else {
                const newClass = this.createClassFromKey(undefined, key)
                newClass?.replace?.(value)
                return newClass
            }
        })

        if(_.isObject(this.objectClasses)) {
            this.objectClasses = _.assign(this.objectClasses, additionalClass)
        } else {
            this.objectClasses = additionalClass
        }
        this.dataObject = newPlan
    }

}