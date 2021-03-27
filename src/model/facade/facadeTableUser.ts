import { Transaction } from 'knex'
import _ from 'lodash'
import Password from '../orm/password'
import Role from '../orm/role'
import User from '../orm/user'
import { FacadeTable } from "./facadeTable"

/**@classdesc Для таблицы user, включает работу с поролем */

export default class FacadeTableUser extends FacadeTable {
    constructor(actorId: number, options?: { isSaveHistory?: boolean }) {
        super("user", actorId, options)
    }

    async insert(data: any, trxOpt?: Transaction<any, any>) {
        if (!data.role_id) {
            data.role_id = (<any>await Role.query().where("role", "user").first()).id
        }
        if (data.login && await User.query(trxOpt).where("login", data.login).first()) {
            throw this.handleErr.mustBeUniq("login")
        }
        const result = await super.insert(_.omit(data, "password"), trxOpt)
        await (<any>Password).query(trxOpt).insert({ id: result, password: data.password })
        return result
    }

    async patch(data: any, trxOpt?: Transaction<any, any>) {
        if (data.login && await User.query(trxOpt).where("login", data.login).first()) {
            throw this.handleErr.mustBeUniq("login")
        }
        const id = await super.patch(_.omit(data, "password"), trxOpt)
        if (data.password) {
            await (<any>Password).query(trxOpt).findById(id).patch({ password: data.password })
        }
        return id
    }
}