/**
 * Класс отвечает за парсинг объектов с sql и value свойствами
 */

import _ from "lodash";
import { classInterface } from "../../../type/type";
import { initAttr, startInit } from "../../libs/initHelper";
import { sqlsToValues } from "../../libs/queryHelper";

export default class BaseValueBlock implements classInterface.valueBlock {

    private initAttr?: initAttr
    private sql: Record<any, string>
    private value: Record<any, any>
    private tempRep: classInterface.templateReplace

    constructor(
        value: { value: any | any[], sql: string | string[] },
        tempRec: classInterface.templateReplace) {
        this.tempRep = tempRec
        this.sql = <any>this.warpToArray(value.sql)
        this.value = this.warpToArray(value.value)
    }

    /**Совершает все шаги для генерации массива значений id в values*/
    private init() {
        return startInit(this.initAttr, async () => {
            await this.subsValueDeep(this.sql)
            await this.subsValueDeep(this.value)
            await this.sqlsToValuesDeep(this.sql)
        })
    }

    /**Ищет в объекте строки с шаблонами и меняет их на значения*/
    private async subsValueDeep(val: Record<string | number, any>) {
        for (let key in val) {
            if (_.isString(val[key])) {
                val[key] = await this.tempRep.replaceStr(val[key])
            } else if (_.isObject(val[key])) {
                this.subsValueDeep(val[key])
            }
        }
    }

    /**подготавливает значения, если значение примитивное заменяет на массив с этим значением*/
    private warpToArray(val: any): any[] {
        if (typeof val !== "object") {
            return [val]
        } else {
            return val
        }
    }

    /**Находит в обьекте все строки и делает запрос в БД и меняет их на значения*/
    private async sqlsToValuesDeep(sqlObj: Record<any, any>) {
        for (let key in sqlObj) {
            if (_.isString(sqlObj[key])) {
                sqlObj[key] = await sqlsToValues(sqlObj[key])
            } else if (_.isObject(sqlObj[key])) {
                this.sqlsToValuesDeep(sqlObj[key])
            }
        }
    }

    /**Получить значения*/
    async get() {
        await this.init()
        const res = this.value
        return res
    }
}