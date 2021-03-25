import SubBlockGroup from './SubBlockGroup'
import SubBlockValue from './SubBlockValue';
import SubBlockType from './SubBlockType';
import TempRep from './../TempRep';
import _ from 'lodash';

/**
 * Отвечает за парсинг единичного блока подтверждения
 * @class
 */
export default class ConfirmBlock {

    private subBlockGroup: SubBlockGroup
    private subBlockValue: SubBlockValue
    private subBlockType: SubBlockType

    constructor(confirmBlock: any, tempRep: TempRep) {
        this.subBlockGroup = new SubBlockGroup(confirmBlock.group, tempRep)
        this.subBlockValue = new SubBlockValue({sql: confirmBlock.sql, value: confirmBlock.value}, tempRep)
        this.subBlockType = new SubBlockType(confirmBlock.type, confirmBlock.type_desc)
    }

    /**Если входная запись не содержит подтверждения или отклонения для данного блока,
     * возвращает запись подтверждения для данного блока с разрещенными значениями
     * в противном случае возвращает void
     */
    async getNeedConfirm(confirm: any | null) {
        if (!await this.isConfirm(confirm)) {
            return {
                group: await this.subBlockGroup.get(),
                user_id: await this.subBlockValue.getConfirm()
            }
        }
    }

    /**Если входная запись содержит подтверждение для данного блока,
     * возвращает запись подтверждения для данного блока
     * в противном случае возвращает void
     */
    async getAccept(confirm: any | null) {
        if (await this.isConfirm(confirm)) {
            const res = {
                group: await this.subBlockGroup.get(),
                user_id:  _.flattenDeep([confirm?.id])
            }
            return res
        }
    }

    /**Если входная запись содержит отклонение для данного блока,
     * возвращает запись отклонения для данного блока
     * в противном случае возвращает void
     */
    async getReject(confirm: any | null) {
        if (await this.isReject(confirm)) {
            return {
                group: await this.subBlockGroup.get(),
                user_id:  _.flattenDeep([confirm?.id])
            }
        }
    }

    /**Проверяет может ли входная запись считаться подтверждением для данного блока */
    async isConfirm(confirm: any) {
        if (confirm == null) {
            return false
        }
        const isConfType = await this.subBlockType.isConfirm(confirm?.type)
        //const isConfVal = await this.subBlockValue.isContain(confirm?.id)
        return isConfType //&& isConfVal
    }

    /**Проверяет может ли входная запись считаться отклонением для данного блока */
    async isReject(confirm: any) {
        if (confirm == null) {
            return false
        }
        const isRejType = await this.subBlockType.isReject(confirm?.type)
        //const isConfVal = await this.subBlockValue.isContain(confirm?.id)
        return isRejType //&& isConfVal
    }

    /**Возвращает запись отклонения для записи в поле события для данного блока 
     * если user_id имеет на это право и если входные данные из колонки события
     * разрешают это действия (не заполнены другим подтверждением или отклонением)
    */
    async genReject(confirm: Record<any, any> | null, userId: number) {
        const isContain = await this.subBlockValue.isContain(confirm?.id)
        const isConfirm = await this.subBlockType.isConfirm(confirm?.type)
        const isReject = await this.subBlockType.isReject(confirm?.type)
        if (isContain && !isConfirm && !isReject) {
            return this.subBlockType.genReject(userId)
        }
    }

    /**Возвращает запись подтверждения для записи в поле события для данного блока 
     * если user_id имеет на это право и если входные данные из колонки события
     * разрешают это действия (не заполнены другим подтверждением или отклонением)
    */
    async genAccept(confirm: Record<any, any> | null, userId: number, type: string, sendObject: any) {
        const isContain = await this.subBlockValue.isContain(userId)
        const isConfirm = await this.subBlockType.isConfirm(confirm?.type)
        const isReject = await this.subBlockType.isReject(confirm?.type)
        if (isContain && !isConfirm && !isReject && this.subBlockType.getName() === type) {
            return this.subBlockType.genAccept(userId, sendObject)
        }
    }

}