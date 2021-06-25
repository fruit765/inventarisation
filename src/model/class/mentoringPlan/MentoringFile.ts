import _ from "lodash"
import CreateErr from "../createErr"
import { stat } from 'fs/promises'
/**
 * Класс для работы с файлами в плане
 * @class
 */
export default class MentoringFile {

    private mentoringId: number
    private createErr: CreateErr

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
        console.log(await stat(pathOnly + fileName))

        // файла не существует
        return fileName
    }

    path(filename: string) {
        return this.getPrefixPath() + filename
    }

}