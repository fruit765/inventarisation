import { Transaction } from "knex"
import { tableRec } from "../../../type/type";
import Event_confirm from "../../orm/event_confirm";
import Addition from "./additional/Addition";
import PresetAllCol from './preset/presetAllCol';
import ConfirmCheck from './confirm/ConfirmCheck';
import TempRep from './TempRep';

/**@classdesc класс отечающий за один пресет */
export default class Preset {
    private id: number
    private presetAllCol?: PresetAllCol
    private presetRec: any

    constructor(presetRec: any) {
        this.presetRec = presetRec
        this.id = presetRec.id
    }

    /** Проверяет запись в истории на соответствии пресету, если соответствует генерирует событие*/
    async genEventsByHisRec(hisRec: any, actualData: any, trx: Transaction<any, any>) {
        this.presetAllCol = this.presetAllCol ?? new PresetAllCol(this.presetRec.preset)
        if (await this.presetAllCol.match([hisRec.diff, actualData])) {
            await <Promise<any>>Event_confirm.query(trx)
                .insert(
                    {
                        //@ts-ignore
                        history_id: <number>hisRec.id, //NOSONAR
                        event_confirm_preset_id: this.id,
                        status: "pending"
                    })
                .onConflict()
                .ignore()
        }
    }

    getConfirmCheck (hisRec: tableRec.history) {
        return new ConfirmCheck(this.presetRec.confirm, new TempRep(hisRec))
    }

    getAddition (hisRec: tableRec.history) {
        return new Addition(this.presetRec.additional, new TempRep(hisRec))
    }
}