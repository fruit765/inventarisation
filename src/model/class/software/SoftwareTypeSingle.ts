import _ from "lodash"
import knex from "../../orm/knexConf"
import CreateErr from './../createErr'
import { classInterface } from '../../../type/type'

export default class SoftwareTypeSingle implements classInterface.softwareConnector {

    protected software
    protected owner
    protected createErr: CreateErr

    constructor(software: any, owner: any[]) {
        this.software = software
        this.owner = owner
        this.createErr = new CreateErr()
    }

    protected async getBindInfo() {
        if (!this.owner.length) {
            return { deviceAttached: 1 }
        } else {
            return {}
        }
    }

    async get() {
        return { ...this.software, ...{ bindInfo: await this.getBindInfo() } }
    }

    async bind(message: any) {
        const bindInfo = await this.getBindInfo()
        if (bindInfo.deviceAttached && message.device_id) {
            const duplicate = _.filter(this.owner, { device_id: message.device_id })
            if (duplicate.length) {
                throw this.createErr.attachAlreadyExists()
            }
            const insertData = { device_id: message.device_id, software_id: this.software.id }
            await <Promise<number[]>>knex("software_owner").insert(insertData)
            this.owner.push(insertData)
        } else {
            throw this.createErr.attachDisallowed()
        }
    }

    async unbind(message: any) {
        const binding = _.filter(this.owner, { device_id: message.device_id })
        if (!binding.length) {
            throw this.createErr.attachNotExist()
        }

        await <Promise<number[]>>knex("software_owner")
            .where("software_id", this.software.id)
            .where({ device_id: message.device_id })

        this.owner = _.filter(this.owner, x => x.device_id !== message.device_id)
    }
}