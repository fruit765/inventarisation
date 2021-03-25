import { classInterface, tableRec } from "../../../type/type"
import { getTabIdFromHis } from "../../libs/bindHisTabInfo"
import { initAttr, startInit } from "../../libs/initHelper"
import { uniqObjToBoolObj } from "../../libs/objectOp"
import Event_confirm from "../../orm/event_confirm"
import CreateErr from './../createErr'
import ConfirmCheck from './../preset/confirm/ConfirmCheck'
import Preset from './../preset/Preset';
import dayjs from 'dayjs';
import { RecHistory } from "../history/recHistory"
import { startTransOpt } from "../../libs/transaction"

/**
 * Класс события, предстваляет сущность события
 * @class
 */
export default class RecEvent {

    private readonly handleErr: CreateErr
    private initAttr: initAttr
    private eventRec: tableRec.event
    private hisRec: tableRec.history
    private presetRec: tableRec.preset
    private confirmCheck: ConfirmCheck
    private addition: classInterface.additionModule

    private other: {
        table_id: number
        confirm_need: Record<any, any>
        confirm_accept: Record<any, any>
        confirm_reject: Record<any, any>
        personal_ids: Record<any, any>
        additional: Record<any, any>
    }

    constructor(
        eventRec: tableRec.event,
        hisRec: tableRec.history,
        presetRec: tableRec.preset
    ) {
        this.handleErr = new CreateErr()
        this.eventRec = eventRec
        this.hisRec = hisRec
        this.presetRec = presetRec
        const preset = new Preset(presetRec)
        this.confirmCheck = preset.getConfirmCheck(hisRec)
        this.addition = preset.getAddition(hisRec)

        const tableId = getTabIdFromHis(hisRec)

        if (!tableId) {
            throw this.handleErr.internalServerError()
        }

        this.other = {
            table_id: tableId,
            confirm_need: [],
            confirm_accept: [],
            confirm_reject: [],
            personal_ids: [],
            additional: []
        }
    }

    /**Инициализация, запускает асинзронные функции для генерации необходимых для работы значений */
    init() {
        return startInit(this.initAttr, async () => {
            this.other.confirm_need = await this.confirmCheck.getNeedConfirm(this.eventRec.confirm)
            this.other.confirm_need?.forEach((element: any) => {
                element.user_id = uniqObjToBoolObj(element.user_id)
            })
            this.other.confirm_accept = await this.confirmCheck.getAccept(this.eventRec.confirm)
            this.other.confirm_accept?.forEach((element: any) => {
                element.user_id = uniqObjToBoolObj(element.user_id)
            })
            this.other.confirm_reject = await this.confirmCheck.getReject(this.eventRec.confirm)
            this.other.confirm_reject?.forEach((element: any) => {
                element.user_id = uniqObjToBoolObj(element.user_id)
            })
            this.other.personal_ids = await this.confirmCheck.getPersonal(this.eventRec.confirm)
            this.other.personal_ids = uniqObjToBoolObj(this.other.personal_ids)
            this.other.additional = await this.addition.get()
        })
    }

    /**Получить запись события, возвращает объект необходимый для отоброжения на фронтэнде */
    async get() {
        await this.init()
        const res = {
            history_id: this.eventRec.history_id,
            event_confirm_preset_id: this.eventRec.event_confirm_preset_id,
            status: this.eventRec.status,
            date: this.eventRec.date,
            date_completed: this.eventRec.date_completed,
            actor_id: this.hisRec.actor_id,
            table: this.presetRec.table,
            name: this.presetRec.name,
            name_rus: this.presetRec.name_rus,
            table_id: this.other.table_id,
            personal_ids: this.other.personal_ids,
            confirm_need: this.other.confirm_need,
            confirm: this.other.confirm_accept,
            confirm_reject: this.other.confirm_reject,
            additional: this.other.additional,
        }
        return res
    }

    /**Простое подтверждение, устанавливает подтверждение от данного пользователя*/
    async simpleAccept(userId: number) {
        const simpleAccept = await this.confirmCheck.genAccept(this.eventRec.confirm, userId, "simple", { action: "accept" })
        const insertData: any = { confirm: JSON.stringify(simpleAccept) }
        if (await this.confirmCheck.isConfirm(simpleAccept)) {
            insertData.status = "complete"
            insertData.date_completed = dayjs().toISOString()
        }
        startTransOpt(undefined, async trx => {
            await Event_confirm.query(trx).where({
                history_id: this.eventRec.history_id,
                event_confirm_preset_id: this.eventRec.event_confirm_preset_id
            }).patch(insertData)
            await new RecHistory(this.hisRec, trx).tryCommit()
        })
        Object.assign(this.eventRec, insertData, { confirm: simpleAccept })
    }

    /**Отклоняет событие*/
    async reject(userId: number) {
        const reject = await this.confirmCheck.genReject(this.eventRec.confirm, userId)
        const insertData: any = { confirm: JSON.stringify(reject) }
        if (await this.confirmCheck.isConfirm(reject)) {
            insertData.status = "reject"
            insertData.date_completed = dayjs().toISOString()
        }

        await Event_confirm.query().where({
            history_id: this.eventRec.history_id,
            event_confirm_preset_id: this.eventRec.event_confirm_preset_id
        }).patch(insertData)
        Object.assign(this.eventRec, insertData, { confirm: reject })
    }
}