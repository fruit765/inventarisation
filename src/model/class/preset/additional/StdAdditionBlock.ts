import { classInterface } from '../../../../type/type';
import BaseValueBlock from '../BaseValueBlock';
import SubBlockGroup from '../confirm/SubBlockGroup';

/**
 * Класс отвечает за стандартный модуль "stdModule" в поле additional пресета
 * @class
 */
export default class StdAdditionsBlock implements classInterface.additionModule {

    private valueClass: classInterface.valueBlock
    private nameClass: classInterface.stringBlock

    constructor(additionBlock: any, tempRep: classInterface.templateReplace) {
        this.valueClass = new BaseValueBlock({ sql: additionBlock.sql, value: additionBlock.value }, tempRep)
        this.nameClass = new SubBlockGroup(additionBlock.name, tempRep)
    }

    /**Возвращает значения полученные после парсинга в "stdModule" */
    async get() {
        const res = {
            value: await this.valueClass.get(), 
            name: await this.nameClass.get()
        }
        return res
    }
}