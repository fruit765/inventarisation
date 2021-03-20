export namespace tableRec  {
    export interface history {
        id: number
        actor_id: number
        device_id: number | null
        user_id: number | null
        account_id: number | null
        account_owner_id: string | null
        comments: string | null
        date: Record<any, any>
        diff: Record<any, any>
        action_tag: string
        commit_date: Record<any, any> | null
    }

    export interface event {
        event_confirm_preset_id: number
        history_id: number
        confirm: null | Record<any, any>
        status: string
        date: Record<any, any>
        date_completed: Record<any, any> | null
    }

    export interface preset {
        id: number
        table: string
        preset: Record<any, any>
        confirm: Record<any, any>
        additional: Record<any, any> | null
        start_preset_date: Record<any, any>
        name: string
        name_rus: string
        end_preset_date: Record<any, any> | null
        view_priority: number
        status_id: null | string
    }
}

export namespace otherType {
    export interface eventKey {
        history_id: number,
        event_confirm_preset_id: number
    }
}

export namespace classInterface {
    export interface typeStrategy {
        isConfirm: (type: any) => Promise<boolean>
        genAccept: (sendObject: any) => Promise<Record<string,any>>
    }

    export interface additionModule {
        get: () => Promise<any>
    }

    export interface templateReplace {
        replaceStr: (str: string) => Promise<string>
    }

    export interface valueBlock {
        get: () => Promise<any>
    }

    export interface stringBlock {
        get: () => Promise<any>
    }
}