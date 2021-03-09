import _ from 'lodash'
import { getTabIdFromHis, getTabNameFromHis } from '../../libs/bindHisTabInfo'
import { hasCol, sqlsToValues } from '../../libs/queryHelper'
import { CreateErr } from './../createErr'

export default class TempRep {
    private hisRec: any
    private tableId: number
    private table: string
    private handleErr: CreateErr

    constructor(hisRec: any) {
        this.handleErr = new CreateErr()
        this.hisRec = hisRec
        const tableId = getTabIdFromHis(hisRec)
        const table = getTabNameFromHis(hisRec)
        if (!tableId || !table) {
            throw this.handleErr.internalServerError()
        }
        this.tableId = tableId
        this.table = table
    }

    async resolveStr(val: string) {
        const presetVal = val.match(/(?<=\${).+(?=})/gi) ?? []
        for (let value of presetVal) {
            const resolve = await this.getVal(value)
            val = val.replace(new RegExp("${" + value + "}", "gi"), resolve[0])
        }
        return val
    }

    /**Возвращает значение полученное из diff
     * Если значения не будет попробуйет получить его из изменяемой таблицы*/
    private async getDiffVal(path: string): Promise<any[]> {
        let value = _.get(this.hisRec, path)
        if (value === undefined) {
            const subPath = path.match(/(?<=diff.).+/gi)
            if (subPath?.[0] && await hasCol(this.table, subPath?.[0])) {
                const sql = `select ${this.table}.${subPath} from ${this.table}`
                return sqlsToValues(sql)
            } else {
                return []
            }
        } else {
            return _.flattenDeep([value])
        }
    }

    /**Возвращает значение по шаблону */
    async getVal(path: string) {
        if (path === "table") {
            return [this.table]
        } else if (path === "table_id") {
            return [this.tableId]
        } else if (path.match(/(?<=diff.).+/gi)) {
            return this.getDiffVal(path)
        } else {
            return [this.hisRec[path]]
        }
    }
}