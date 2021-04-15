import { FacadeTable } from './facadeTable'

export default class FacadeTabSoftware extends FacadeTable {
    constructor(actorId: number, options?: { isSaveHistory?: boolean }) {
        super("software", actorId, options)
    }
}