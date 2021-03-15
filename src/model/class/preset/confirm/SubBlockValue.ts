import _ from "lodash"
import { initAttr, startInit } from "../../../libs/initHelper"
import { sqlsToValues } from "../../../libs/queryHelper"
import TempRep from "../TempRep"

export default class SubBlockValue {
    private readonly sql: string[]
    private value: (string | number)[]
    private initAttr?: initAttr
    private readonly tempRep: TempRep

    constructor(valueBlock: {
        sql: string | string[],
        value: string | number | string[] | number[]
    }, tempRep: TempRep) {
        this.tempRep = tempRep
        this.value = this.warpToArray(valueBlock.value)
        this.sql = this.warpToArray(valueBlock.sql)
    }

    /**Совершает все шаги для генерации массива значений id в values*/
    private init() {
        return startInit(this.initAttr, async () => {
            await this.subsValue(this.sql)
            await this.subsValue(this.value)
            await this.sqlToValue()
            this.value = this.toNumArray(this.value)
        })
    }

    /**Преобразует все строковые значения в массиве в числа */
    private toNumArray(values: (string | number)[]): number[] {
        return _.map(_.flattenDeep(values), Number)
    }

    /**подготавливает значения, если значение примитивное заменяет на массив с этим значением
     * если нет пытается разгладит объект*/
    private warpToArray(val: any): any[] {
        if (val == undefined) {
            return []
        } else if (typeof val !== "object") {
            return [val]
        } else {
            return _.flattenDeep(val)
        }
    }

    /**Ищет в строках массивов шаблоны и меняет их на значения*/
    private async subsValue(val: any[]) {
        for (let key in val) {
            if (_.isString(val[key])) {
                val[Number(key)] = await this.tempRep.resolveStr(val[key])
            }
        }
    }


    /**Преобразует sql строки в значения*/
    private async sqlToValue() {
        const sqlVal = await sqlsToValues(this.sql)
        this.value = _.concat(this.value, sqlVal)
        this.value = _.flattenDeep(this.value)
    }

    /**Возвращает массив id которые нужны для подтверждения */
    async getConfirm() {
        await this.init()
        return this.value
    }

    /**Получает массив или значение если его можно считать подтверждением выдает true */
    async isConfirm(val: number | number[]) {
        await this.init()
        const value = this.warpToArray(val)
        for (let key in value) {
            if (this.value.includes(value[key])) {
                return true
            }
        }
        return false
    }

    // /**Получает массив или значение если его можно считать
    //  * подтверждением выдает пустой массив иначе массив значений кто должен подтвердить */
    // async getNeedConfirm(val: number | number[]) {
    //     if (await this.isConfirm(val)) {
    //         return this.value
    //     } else {
    //         return this.getConfirm()
    //     }
    // }
}