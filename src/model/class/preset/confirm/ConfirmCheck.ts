import _ from "lodash"
import ConfirmBlock from "./ConfirmBlock"
import TempRep from './../TempRep';

/**
 * Отвечает за парсинг поля подтверждений в пресете
 * @class
 */

export default class ConfirmCheck {
    private confirmBlocks: ConfirmBlock[]

    constructor(confirm: Record<any, any>, tempRep: TempRep) {
        this.confirmBlocks = []
        _.forEach(confirm.confirms, (element, key) => {
            this.confirmBlocks[Number(key)] = new ConfirmBlock(element, tempRep)
        })
    }

    /**
     * Возвращает неподтвержденные блоки подтверждений, с разрешенными значениями
     * в виде разреженного массива
     */
    private async getNeedConfirmNull(confirm: Record<any, any> | null) {
        if(await this.isReject(confirm)) {
            return []
        }

        return await Promise.all(_.map(this.confirmBlocks, (value, key) => {
            return value.getNeedConfirm(confirm?.confirms?.[String(key)])
        }))
    }

    /**Возвращает неподтвержденные блоки подтверждений, с разрешенными значениями
     * в виде непрерывного массива
     */
    async getNeedConfirm(confirm: Record<any, any> | null) {
        const NeedConfirmNull = await this.getNeedConfirmNull(confirm)
        return _.compact(NeedConfirmNull)
    }

    /**
     * Возвращает отклоненные блоки подтверждений, с разрешенными значениями
     * в виде разреженного массива
     */
    private async getRejectNull(confirm: Record<any, any> | null) {
        return await Promise.all(_.map(this.confirmBlocks, (value, key) => {
            return value.getReject(confirm?.confirms?.[String(key)])
        }))
    }

    /**Возвращает отклоненные блоки подтверждений, с разрешенными значениями
     * в виде непрерывного массива
     */
    async getReject(confirm: Record<any, any> | null) {
        const acceptNull = await this.getRejectNull(confirm)
        return _.compact(acceptNull)
    }

    /**
     * Возвращает подтвержеденные блоки подтверждений, с разрешенными значениями
     * в виде разреженного массива
     */
    private async getAcceptNull(confirm: Record<any, any> | null) {
        return await Promise.all(_.map(this.confirmBlocks, (value, key) => {
            return value.getAccept(confirm?.confirms?.[String(key)])
        }))
    }

    /**Возвращает подтвержеденные блоки подтверждений, с разрешенными значениями
     * в виде непрерывного массива
     */
    async getAccept(confirm: Record<any, any> | null) {
        const acceptNull = await this.getAcceptNull(confirm)
        return _.compact(acceptNull)
    }

    /**Возвращает user_id тех пользователей для которых событие является личным */
    async getPersonal(confirm: Record<any, any> | null) {
        const res: any[] = []
        const acceptNull = await this.getAcceptNull(confirm)
        const NeedConfirmNull = await this.getNeedConfirmNull(confirm)
        for (let key in NeedConfirmNull) {
            if (acceptNull[key] != null) {
                res[Number(key)] = acceptNull[key]?.user_id
            } else {
                res[Number(key)] = NeedConfirmNull[key]?.user_id
            }
        }

        return _.flattenDeep(res)
    }

    /**Возвращает новую запись в которой сделанно отклоненние от данного пользователя, если он имеет такое право
     * если нет вернет первоночальную запись
     */
    async genReject(confirm: Record<any, any> | null, userId: number) {

        const result = await Promise.all(this.confirmBlocks.map((value, key) => {
            return value.genReject(confirm?.confirms?.[key], userId)
        }))

        const resultUnion = _.merge({}, confirm, { confirms: _.pickBy(result, Boolean) })
        return resultUnion
    }

    /**Возвращает новую запись в которой сделанно подтверждение от данного пользователя, если он имеет такое право
     * если нет вернет первоночальную запись
     */
    async genAccept(confirm: Record<any, any> | null, userId: number, type: string, sendObject: any) {
        const result = await Promise.all(this.confirmBlocks.map((value, key) => {
            return value.genAccept(confirm?.confirms?.[key], userId, type, sendObject)
        }))

        const resultUnion = _.merge({}, confirm, { confirms: _.pickBy(result, Boolean) })
        return resultUnion
    }

    /**Проверяет является ли запись запись отклоненной */
    async isReject(confirm: Record<any, any> | null) {
        for (let key in this.confirmBlocks) {
            const value = await this.confirmBlocks[key].isReject(confirm?.confirms?.[key])
            if (value) {
                return true
            }
        }
        return false
    }

    /**Проверяет является ли запись запись подтвержденной */
    async isConfirm(confirm: Record<any, any> | null) {
        const result = []
        for (let key in this.confirmBlocks) {
            const value = await this.confirmBlocks[key].isConfirm(confirm?.confirms?.[key])
            result.push(value)
        }
        return !result.includes(false)
    }
}