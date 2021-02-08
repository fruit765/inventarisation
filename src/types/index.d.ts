import Objection = require("objection")

export interface tableOptions {
    isSaveHistory?: boolean
    actorId?: number
}

export class Events {
    constructor(tableName: string)
    public getUnconfirmData(): Promise<Object[]>
    public getUnconfirmDataById(id: number): Promise<Object>
    public rejectAllByStatus(status: string): Promise<Object>
    public static getUnconfirmData(tableName: string, priority: number): Promise<Object[]>
    public static getUnconfirmDataById(tableName: string, id: number, priority: number): Promise<Object>
    public static rejectAllByStatus(tableName: string, status: string): Promise<Object>
    public static getEvents(): Promise<Object[]>
}



