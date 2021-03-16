import { classInterface } from '../../../../type/type'
import { startInit, initAttr } from '../../../libs/initHelper'
import { sqlsToValues } from '../../../libs/queryHelper'
import TempRep from '../TempRep'

type groupRec = {
    sql?: string
    value?: string
} | string

export default class SubBlockGroup {
    private value?: string
    private sql?: string
    private tempRep: classInterface.templateReplace
    private initAttr?: initAttr

    constructor(groupRec: groupRec, tempRep: classInterface.templateReplace) {
        this.tempRep = tempRep
        if (typeof groupRec === "string") {
            this.value = groupRec
        } else if (groupRec.value != undefined) {
            this.value = typeof groupRec.value === "string" ?
                groupRec.value :
                groupRec.value[0]
        } else if (groupRec.sql != undefined) {
            this.sql = groupRec.sql
        }
    }

    private init() {
        return startInit(this.initAttr, async () => {
            if (this.sql == undefined && this.value == undefined) {
                this.value = undefined
                return
            } else if (this.value != undefined) {
                this.value = await this.tempRep.replaceStr(this.value)
                return
            } else if (this.sql != undefined) {
                this.sql = await this.tempRep.replaceStr(this.sql)
                this.value = (await sqlsToValues(this.sql))[0]
            }
        })
    }

    /**Возвращает имя группы*/
    async get() {
        await this.init()
        return this.value ?? "NoName"
    }
}