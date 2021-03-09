import _ from "lodash"
import { sqlsToValues } from "../../../libs/queryHelper"

export default class BlockValue {
    private sql: any
    private value: any

    constructor(valueBlock: any, hisRec: any) {
        this.value = valueBlock.value
        this.sql = valueBlock.sql
    }

    /**
     * Делает запросы переводя все sql значения в обычные value
     */
    async sqlToValue() {
        const sqlVal = await sqlsToValues(this.sql)
        this.value = _.concat(this.value, sqlVal)
    }
}