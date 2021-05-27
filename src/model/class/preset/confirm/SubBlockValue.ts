import _ from "lodash"
import TempRep from "../TempRep"
import BaseValueBlock from './../BaseValueBlock';

export default class SubBlockValue {
    private baseValueClass: BaseValueBlock

    constructor(valueBlock: {
        sql: string | string[],
        value: string | number | string[] | number[]
    }, tempRep: TempRep) {
        this.baseValueClass = new BaseValueBlock(
            {
                value: valueBlock.value,
                sql: valueBlock.sql
            }, tempRep)
    }

    /**Возвращает массив id которые нужны для подтверждения */
    async getConfirm() {
        const result = await this.baseValueClass.getUniqArray()
        if (!_.isArray(result)) {
            throw new Error("must be array")
        }
        return result
    }

    /**Получает массив или значение если его можно считать подтверждением выдает true */
    async isContain(val: number | undefined) {
        if (val == undefined) {
            return false
        }

        const values = await this.getConfirm()
        return values.includes(val)
    }

}