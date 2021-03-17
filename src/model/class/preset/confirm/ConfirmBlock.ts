import SubBlockGroup from './SubBlockGroup'
import SubBlockValue from './SubBlockValue';
import SubBlockType from './SubBlockType';
import TempRep from './../TempRep';
import _ from 'lodash';

export default class ConfirmBlock {

    private subBlockGroup: SubBlockGroup
    private subBlockValue: SubBlockValue
    private subBlockType: SubBlockType

    constructor(confirmBlock: any, tempRep: TempRep) {
        this.subBlockGroup = new SubBlockGroup(confirmBlock.group, tempRep)
        this.subBlockValue = new SubBlockValue({sql: confirmBlock.sql, value: confirmBlock.value}, tempRep)
        this.subBlockType = new SubBlockType(confirmBlock.type, confirmBlock.type_desc)
    }

    async getNeedConfirm(confirm: any | null) {
        if (!await this.isConfirm(confirm)) {
            return {
                group: await this.subBlockGroup.get(),
                user_id: await this.subBlockValue.getConfirm()
            }
        }
    }

    async getAccept(confirm: any | null) {
        if (await this.isConfirm(confirm)) {
            return {
                group: await this.subBlockGroup.get(),
                user_id:  _.flattenDeep([confirm.id])
            }
        }
    }

    async isConfirm(confirm: any) {
        if (confirm == null) {
            return false
        }
        const isConfType = await this.subBlockType.isConfirm(confirm?.type)
        //const isConfVal = await this.subBlockValue.isContain(confirm?.id)
        return isConfType //&& isConfVal
    }

    private async isReject(confirm: any) {
        if (confirm == null) {
            return false
        }
        const isRejType = await this.subBlockType.isReject(confirm?.type)
        //const isConfVal = await this.subBlockValue.isContain(confirm?.id)
        return isRejType //&& isConfVal
    }

    async getReject(confirm: any | null) {
        
    }

    async genReject(confirm: Record<any, any> | null, userId: number) {
        const isContain = await this.subBlockValue.isContain(confirm?.id)
        const isConfirm = await this.subBlockType.isConfirm(confirm?.type)
        const isReject = await this.subBlockType.isReject(confirm?.type)
        if (isContain && !isConfirm && !isReject) {
            return this.subBlockType.genReject()
        }
    }

    async genAccept(confirm: Record<any, any> | null, userId: number, type: string, sendObject: any) {
        const isContain = await this.subBlockValue.isContain(confirm?.id)
        const isConfirm = await this.subBlockType.isConfirm(confirm?.type)
        const isReject = await this.subBlockType.isReject(confirm?.type)
        if (isContain && !isConfirm && !isReject && this.subBlockType.getName() === type) {
            return this.subBlockType.genAccept(sendObject)
        }
    }

}