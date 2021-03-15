import _ from 'lodash'
import { tableRec } from '../../../type/type'
import { getTabIdFromHis, getTabNameFromHis } from '../../libs/bindHisTabInfo'
import { hasCol, sqlsToValues } from '../../libs/queryHelper'
import CreateErr from '../createErr'

export default class TempRep {
    private readonly hisRec: any
    private readonly tableId: number
    private readonly table: string
    private readonly handleErr: CreateErr

    constructor(hisRec: tableRec.history) {
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

    /**Заменяет все шаблоны в строке на значения */
    async resolveStr(val: string) {
        const presetVal = val.match(/(?<=\${).+(?=})/gi) ?? []
        for (let value of presetVal) {
            const resolve = await this.getVal(value)
            val = val.replace(new RegExp("\\${" + value + "}", "gi"), resolve[0])
        }

        return  val
    }

    /**Возвращает значение полученное из diff
     * Если значения не будет попробуйет получить его из изменяемой таблицы*/
    private async getDiffVal(path: string): Promise<any[]> {
        let value = _.get(this.hisRec, path)
        if (value === undefined) {
            const subPath = path.match(/(?<=diff.).+/gi)
            if (subPath?.[0] && await hasCol(this.table, subPath?.[0])) {
                const sql = `select ${this.table}.${subPath} from ${this.table} where id = ${this.tableId}`
                return sqlsToValues(sql)
            } else {
                return []
            }
        } else {
            return _.flattenDeep([value])
        }
    }

    /**Возвращает значение по шаблону */
    private async getVal(path: string) {
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