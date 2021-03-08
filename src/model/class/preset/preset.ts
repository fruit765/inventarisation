import Event_confirm from "../../orm/event_confirm"
import PresetAllCol from "./colPresetMatch/presetAllCol"

/**@classdesc класс отвечающий за один пресет */
export class Preset {
    private id: number
    private presetAllCol: PresetAllCol

    constructor(presetRec: any) {
        this.id = presetRec.id
        this.presetAllCol = new PresetAllCol(presetRec.preset)
        this.presetAllCol.init()
    }

    /** Проверяет запись в истории на соответствии пресету, если соответствует генерирует событие*/
    async genEventsByHisRec(hisRec: any, actualData: any) {
        await this.presetAllCol.init()
        if (this.presetAllCol.match([hisRec.diff, actualData])) {
            await <Promise<any>>Event_confirm.query()
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
}