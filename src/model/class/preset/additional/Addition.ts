import TempRep from './../TempRep'
import { classInterface } from "../../../../type/type";
import StdAdditionsBlock from './StdAdditionBlock';

/**
 * Класс отвечает за парсинг поля additional в пресете
 * @class
 */
export default class Addition {

    private additionBlock: classInterface.additionModule[]

    constructor(addition: any, tempRep: TempRep) {
        this.additionBlock = []
        for (let key in addition) {
            for (let blockNum in addition[key]) {
                if (key === "stdModule") {
                    const blockClass = new StdAdditionsBlock(addition[key][blockNum], tempRep)
                    this.additionBlock.push(blockClass)
                }
            }
        }
    }

    /**Возвращает дополнительные данные для отображения в событии*/
    async get() {
        return Promise.all(this.additionBlock.map(value => {
            return value.get()
        }))
    }
}