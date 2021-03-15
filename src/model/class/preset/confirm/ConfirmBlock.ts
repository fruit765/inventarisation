import SubBlockGroup from './SubBlockGroup'
import SubBlockValue from './SubBlockValue';
import SubBlockType from './SubBlockType';

export default class ConfirmBlock {

    private subBlockGroup: SubBlockGroup
    private SubBlockValue: SubBlockValue
    private SubBlockType: SubBlockType

    constructor(element, hisRec) {
        this.subBlockGroup = new SubBlockGroup()
        this.subBlockValue = new SubBlockValue()
        this.subBlockType = new SubBlockType()
    }

    getNeedConfirm(confirm) {

    }
}