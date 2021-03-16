import TempRep from './../TempRep'
import { classInterface } from "../../../../type/type";
import StdAdditionsBlock from './StdAdditionBlock';

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

    async get() {
        return Promise.all(this.additionBlock.map(async value => {
            await value.get()
        }))
    }
}