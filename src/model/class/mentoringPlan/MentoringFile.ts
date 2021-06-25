import CreateErr from "../createErr"
import { promises } from "fs"
import _ from "lodash"
/**
 * Класс для работы с файлами в плане
 * @class
 */
export default class MentoringFile {

    private mentoringId: number
    private createErr: CreateErr

    static async checkFiles(object: any) {
        if (_.isObject(object)) {
            for (let key in object) {
                await (<any>object)[key]?.checkFiles?.()
            }
        }
    }

    constructor(mentoringId: number) {
        this.createErr = new CreateErr()
        this.mentoringId = mentoringId
    }

    private getPrefixPath() {
        return `uploaded/mentoring/${this.mentoringId}/`
    }

    async checkFile(path: string) {
        const pathOnly = path.replace(/[^/]*$/gi, "").replace(/^\//gi, "")
        if (pathOnly !== this.getPrefixPath()) {
            throw this.createErr.incorrectPath(pathOnly)
        }
        const fileName = path.match(/[^/]*$/gi)?.[0]
        if (fileName) {
            throw this.createErr.incorrectFileName(fileName)
        }

        await promises.stat(pathOnly + fileName).catch(() => Promise.reject(this.createErr.fileNotFound(pathOnly + fileName)))

        return fileName
    }

    path(filename: string) {
        return this.getPrefixPath() + filename
    }

    

}