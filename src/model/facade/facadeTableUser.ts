import { Transaction } from 'knex'
import _ from 'lodash'
import { startTransOpt } from '../libs/transaction'
import knex from '../orm/knexConf'
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
        const includeLogin = await User.query(trxOpt).where("login", data.login).first()
        if (data.login && includeLogin?.login !== undefined && includeLogin.login !== data.login) {
            throw this.handleErr.mustBeUniq("login")
        }
        const id = await super.patch(_.omit(data, "password"), trxOpt)
        if (data.password) {
            const isPatch = await (<any>Password).query(trxOpt).findById(id).patch({ password: data.password })
            if (!isPatch) {
                await (<any>Password).query(trxOpt).insert({ id, password: data.password })
            }
        }
        return id
    }

    /**Возвращает записи с неподтверденными данными */
    async getUnconfirm(id?: number | number[], trxOpt?: Transaction<any, any>) {
        return startTransOpt(trxOpt, async trx => {
            const users = await super.getUnconfirm(id, trx)
            const post_dep_loc_ids = users.map(user => user.post_dep_loc_id)
            const dep_locs = await <Promise<any>>knex("dep_loc")
                .transacting(trx)
                .join("post_dep_loc", "dep_loc.id", "=", "post_dep_loc.dep_loc_id")
                .whereIn("post_dep_loc.id", post_dep_loc_ids)
                .select("post_dep_loc.id as post_dep_loc_id", "dep_loc.id as dep_loc_id")
            const dep_locs_indexed = _.keyBy(dep_locs, "post_dep_loc_id")
            users.forEach(user => {
                user.dep_loc_id = dep_locs_indexed?.[user.post_dep_loc_id]?.dep_loc_id
            })
            return users
        })
    }
}