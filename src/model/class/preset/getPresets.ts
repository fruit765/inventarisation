import dayjs from "dayjs"
import Event_confirm_preset from "../../orm/event_confirm_preset"
import { Preset } from "./preset"

/**@classdesc Класс отвечающий за получение экземпляров присетов */
export class GetPresets {
    /**Возвращает активные пресеты*/
    async getActualPresets() {
        const curretDataTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const presets = await Event_confirm_preset.query()
            .where("start_preset_date", "<", curretDataTime)
            .andWhere(
                function (this: any) {
                    this
                        .whereNull("end_preset_date")
                        .orWhere("end_preset_date", ">", curretDataTime)
                }
            )

        return presets.map((x: any) => new Preset(x))
    }
}