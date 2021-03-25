import _ from 'lodash'
import { tableRec, classInterface } from '../../../type/type'
import { getTabIdFromHis, getTabNameFromHis } from '../../libs/bindHisTabInfo'
import { hasCol, sqlsToValues } from '../../libs/queryHelper'
import CreateErr from '../createErr'

export default class TempRep implements classInterface.templateReplace {
    private readonly hisRec: tableRec.history
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
    async replaceStr(str: string) {
        const presetVal = str.match(/(?<=\${).+?(?=})/gi) ?? []
        if (str.match(/\${.+?}/gi)?.[0] === str.trim()) {
            return (await this.getVal(presetVal[0]))?.[0]
        }
        for (let value of presetVal) {
            const resolve = await this.getVal(value)
            str = str.replace(new RegExp("\\${" + value + "}", "gi"), resolve[0])
        }

        return str
    }

    /**Возвращает значение полученное из diff
     * Если значения не будет попробуйет получить его из изменяемой таблицы*/
    private async getDiffVal(path: string) {
        let value = _.get(this.hisRec, "diff."+path)
        if (value === undefined) {
            return this.getTableVal(path)
        } else {
            return _.flattenDeep([value])
        }
    }

    /**Возвращает значение по шаблону из таблицы к которой относится запись в истории*/
    private async getTableVal(path: string) {
        if (path?.[0] && await hasCol(this.table, path?.[0])) {
            const sql = `select ${this.table}.${path} from ${this.table} where id = ${this.tableId}`
            return sqlsToValues(sql)
        } else {
            return []
        }
    }

    /**Возвращает значение по шаблону */
    private async getVal(path: string) {
        if (path === "table") {
            return [this.table]
        } else if (path === "table_id") {
            return [this.tableId]
        } else if (path.match(/(?<=diff.).+/gi)) {
            const subPath = <any>path.match(/(?<=diff.).+/gi)
            return this.getDiffVal(subPath)
        } else if (path.match(/(?<=table.).+/gi)) {
            const subPath = <any>path.match(/(?<=table.).+/gi)
            return this.getTableVal(subPath)
        } else {
            const hisRec = <any>this.hisRec
            return [hisRec[path]]
        }
    }
}