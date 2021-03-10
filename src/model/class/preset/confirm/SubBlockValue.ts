import _ from "lodash"
// import { getTabIdFromHis, getTabNameFromHis } from "../../../libs/bindHisTabInfo"
import { sqlsToValues } from "../../../libs/queryHelper"
import TempRep from "../tempRep"
// import CreateErr from '../../createErr';

export default class SubBlockValue {
    private sql: string[]
    private value: any[]
    // private hisRec: any
    // private tableId: number
    // private table: string
    //private handleErr: CreateErr
    private initAttr?: Promise<boolean>
    private tempRep: TempRep

    constructor(valueBlock: any, tempRep: TempRep) {
        this.tempRep = tempRep
        //this.handleErr = new CreateErr()
        this.value = this.castValToFlatArr(valueBlock.value)
        this.sql = this.castValToFlatArr(valueBlock.sql)
        // this.hisRec = hisRec
        // const tableId = getTabIdFromHis(hisRec)
        // const table = getTabNameFromHis(hisRec)
        // if (!tableId || !table) {
        //     throw this.handleErr.internalServerError()
        // }
        // this.tableId = tableId
        // this.table = table
    }

    private async init() {
        if (this.initAttr) {
            return this.initAttr
        } else {
            const fn = async () => {
                await this.subsValue(this.sql)
                await this.subsValue(this.value)
                await this.sqlToValue()
                this.value = this.arryStrToNum(this.value)
                return true
            }
            this.initAttr = fn()
        }
    }

    /**Преобразует в массиве любые значения на строки 
     * перед этим разглаживает массив*/
    private arryStrToNum(values: any[]) {
        return _.map(_.flattenDeep(values), Number)
    }

    /**подготавливает значения, если значение примитивное заменяет на массив с этим значением
     * если нет пытается разгладит объект*/
    private castValToFlatArr(val: any): any[] {
        if (val == undefined) {
            return []
        } else if (typeof val !== "object") {
            return [val]
        } else {
            return _.flattenDeep(val)
        }
    }

    /**Изменяет массив если в нем найдуться строки со значениями для замены, заменит их на значения */
    private async subsValue(val: any[]) {
        for (let key in val) {
            if (_.isString(val)) {
                val[key] = await this.tempRep.resolveStr(val[key])
            }
        }
    }


    /**Делает запросы переводя все sql значения в обычные value*/
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
        const value = this.castValToFlatArr(val)
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