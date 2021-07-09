import CreateErr from "../createErr"
import { promises } from "fs"
import _ from "lodash"
import { stat } from "fs"
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

    async checkFile(filename: string) {
        const fullName = this.getPrefixPath() + filename
        console.log(fullName)
        stat
        await promises.stat(fullName).catch(() => Promise.reject(this.createErr.mentoringFileNotFound(fullName)))
        console.log(222)
    }

    cutPath(fullName: string) {
        const fileName = fullName.match(/[^/]*$/gi)?.[0]
        if (!fileName) {
            throw this.createErr.mentoringIncorrectFileName()
        }
        return fileName
    }

    path(filename: string) {
        return this.getPrefixPath() + filename
    }

    async deleteExcept(files: string[]) {
        const allFiles = await promises.readdir(this.getPrefixPath())
        const diffFiles = _.difference(allFiles, files)
        for (let value of diffFiles) {
            await promises.rm(value)
        }
    }

    checkForImgExt(filename: string) {
        const allowFormat = [".gif", ".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp", ".png", ".svg", ".webp"]
        const extension = filename.match(/\.[0-9a-z]+$/gi)?.[0]?.toLocaleLowerCase() ?? ""
        if (!allowFormat.includes(extension)) {
            throw this.createErr.mentoringAwaitingImage(filename)
        }
    }

    checkPath(fullName: string) {
        const pathOnly = fullName.replace(/[^/]*$/gi, "").replace(/^\//gi, "")
        if (pathOnly !== this.getPrefixPath()) {
            throw this.createErr.mentoringIncorrectPath(pathOnly)
        }
    }

}