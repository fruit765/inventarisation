import _ from "lodash"
import {sqlsToValues} from "../../../libs/queryHelper"
import TempRep from "../tempRep"

export default class SubBlockValue {
    private readonly sql: string[]
    private value: (string | number)[]
    private initAttr?: Promise<boolean>
    private tempRep: TempRep

    constructor(valueBlock: any, tempRep: TempRep) {
        this.tempRep = tempRep
        this.value = this.warpToArray(valueBlock.value)
        this.sql = this.warpToArray(valueBlock.sql)
    }

    /**Совершает все шаги для генерации массива значений id в values*/
    private async init() {
        if (this.initAttr) {
            return this.initAttr
        } else {
            const fn = async () => {
                await this.subsValue(this.sql)
                await this.subsValue(this.value)
                await this.sqlToValue()
                this.value = this.toNumArray(this.value)
                return true
            }
            this.initAttr = fn()
        }
    }

    /**Преобразует все строковые значения в массиве в числа */
    private toNumArray(values: (string|number)[]): number[] {
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
            if (_.isString(val)) {
                val[key] = await this.tempRep.resolveStr(val[key])
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
    async isNeedConfirm(val: any) {
        await this.init()
        const value = this.warpToArray(val)
        for (let key in value) {
            if (this.value.includes(value[key])) {
                return false
            }
        }
        return true
    }

    /**Получает массив или значение если его можно считать
     * подтверждением выдает пустой массив иначе массив значений кто должен подтвердить */
    async getNeedConfirm(val: any) {
        if (await this.isNeedConfirm(val)) {
            return this.value
        } else {
            return this.getConfirm()
        }
    }
}