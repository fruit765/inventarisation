import { FacadeTable } from './facadeTable'
import knex from '../orm/knexConf'
import _ from 'lodash'
import SoftwareTypeSingle from '../class/software/SoftwareTypeSingle'
import SoftwareTypeMulti from './../class/software/SoftwareTypeMulti'
import { classInterface } from '../../type/type'

export default class FacadeTabSoftware extends FacadeTable {
    constructor(actorId: number, options?: { isSaveHistory?: boolean }) {
        super("software", actorId, options)
    }

    private async createSoftwareClasses(id?: number | number[]): Promise<classInterface.softwareConnector[]> {
        if (typeof id === "number") {
            id = [id]
        }
        const unconfirm = await super.getUnconfirm(id)
        const softwareCatsIds = unconfirm.map(x => x.software_category_id)
        const softwareCats = await <Promise<any[]>>knex("software_category").whereIn("id", softwareCatsIds)
        const catTypesIds = softwareCats.map(x => x.software_cat_type_id)
        const catTypes = await <Promise<any[]>>knex("software_cat_type").whereIn("id", catTypesIds)
        const softOwnersIds = unconfirm.map(x => x.id)
        const softOwners = await <Promise<any[]>>knex("software_owner").whereIn("software_id", softOwnersIds)

        const softwareCatIndex = _.keyBy(softwareCats, "id")
        const catTypeIndex = _.keyBy(catTypes, "id")
        const softOwnersIndex = _.groupBy(softOwners, x => x.software_id)

        return unconfirm.map(elem => {
            const softwareCat = softwareCatIndex[elem.software_category_id]
            const catType = catTypeIndex[softwareCat.software_cat_type_id]
            const softOwner = softOwnersIndex[elem.id] ?? []
            if (catType.name === "single") {
                return new SoftwareTypeSingle(elem, softOwner)
            } else if (catType.name === "multi") {
                return new SoftwareTypeMulti(elem, softOwner)
            } else {
                throw this.handleErr.internalServerError("wrong software type")
            }
        })
    }

    async getUnconfAdditional(id?: number | number[]) {
        const softwares = await this.createSoftwareClasses(id)
        return Promise.all(softwares.map(x => x.get()))
    }

    async bind(id: number, message: any) {
        const software = (await this.createSoftwareClasses(id))[0]
        await software.bind(message)
        return software.get()
    }

    async unbind(id: number, message: any) {
        const software = (await this.createSoftwareClasses(id))[0]
        await software.unbind(message)
        return software.get()
    }
}