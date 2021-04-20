import { classInterface } from '../../../type/type'
import SoftwareTypeSingle from './SoftwareTypeSingle'

export default class SoftwareTypeMulti extends SoftwareTypeSingle implements classInterface.softwareConnector {

    protected async getBindInfo() {
        if (this.owner.length < this.software.specifications?.number ?? 0) {
            return { deviceAttached: 1 }
        } else {
            return {}
        }
    }

    private async getInfo() {
        return {free: (this.software.specifications?.number ?? 0) - this.owner.length}
    }

    async get() {
        return {
            ...this.software,
            ...{ bindInfo: await this.getBindInfo() },
            ...{ info: await this.getInfo() }
        }
    }
}