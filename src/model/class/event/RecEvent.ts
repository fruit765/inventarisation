import { tableRec } from "../../../type/type"
import { getTabIdFromHis } from "../../libs/bindHisTabInfo"
import { initAttr, startInit } from "../../libs/initHelper" 
import { uniqObjToBoolObj } from "../../libs/objectOp"
import CreateErr from './../createErr' 
import ConfirmCheck from './../preset/confirm/ConfirmCheck' 
import Preset from './../preset/Preset';

export default class RecEvent {

    private readonly handleErr: CreateErr
    private initAttr: initAttr
    private eventRec: tableRec.event
    private hisRec: tableRec.history
    private presetRec: tableRec.preset
    private confirmCheck: ConfirmCheck

    private other: {
        table_id: number
        confirm_need: Record<any, any>
        confirm_accept: Record<any, any>
        confirm_reject: Record<any, any>
        personal_ids: Record<any, any>
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
        this.confirmCheck = new Preset(presetRec).getConfirmCheck(hisRec)

        const tableId = getTabIdFromHis(hisRec)

        if (!tableId) {
            throw this.handleErr.internalServerError()
        }

        this.other = {
            table_id: tableId,
            confirm_need: {},
            confirm_accept: {},
            confirm_reject: {},
            personal_ids: {}
        }
    }

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
        })
    }

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
            //additional: { device_user_id: eventHistory.diff.user_id },
        }
        return res
    }
}