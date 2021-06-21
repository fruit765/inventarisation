import { Transaction } from 'knex'
import { FacadeTable } from "./facadeTable"
import _ from "lodash"
import knex from '../orm/knexConf'
import { customAlphabet } from 'nanoid'
import multer from 'multer'
import fs from 'fs'
//@ts-ignore
import { deferred } from 'promise-callbacks'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 14)
const fsPromises = require('fs').promises

/**@classdesc Для таблиц связанных с категориями */

export default class FacadeTabMentoring extends FacadeTable {
    constructor(actorId: number, options?: { isSaveHistory?: boolean }) {
        super("mentoring", actorId, options)
    }

    /**Добовляет данные в таблицу возвражает id записи */
    async insert(data: any, trxOpt?: Transaction<any, any>) {
        const noplanStatusId = await knex("status").where("status", "noplan").first().then((x: { id: number }) => x.id)
        return super.insert({ ...data, status_id: noplanStatusId, plan: null }, trxOpt)
    }

    /**Создание плана*/
    async createPlan(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirm(data.id, trxOpt)
        if (currentMentoring[0]?.status != "noplan" && currentMentoring[0]?.status != "plancreated") {
            throw this.handleErr.statusMustBeNoplanOrPlancreated()
        }
        const planCreatedStatusId = await knex("status").where("status", "plancreated").first().then((x: { id: number }) => x.id)
        return super.patchAndFetch({ ...data, status_id: planCreatedStatusId }, trxOpt)
    }

    /**Подтверждаем план*/
    async acceptPlan(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirm(data.id, trxOpt)
        if (currentMentoring[0]?.status != "plancreated") {
            throw this.handleErr.statusMustBePlancreated()
        }
        const planCreatedStatusId = await knex("status").where("status", "planconfirmed").first().then((x: { id: number }) => x.id)
        return super.patchAndFetch({ ...data, status_id: planCreatedStatusId }, trxOpt)
    }

    /**Загрузка изображений которые будут использоваться в наставничистве */
    async imgLoad(req: any, res: any, next: any) {
        const format = [".gif", ".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp", ".png", ".svg", ".webp"]
        const storage = multer.diskStorage({
            destination: async function (reqx, file, cb) {
                let path = "./uploaded/mentoring/" + reqx.body.id
                if (!fs.existsSync(path)) {
                    await fsPromises.mkdir(path, { recursive: true })
                }
                cb(null, path)
            },
            filename: function (reqx, file, cb) {
                const extension = file.originalname?.match(/\.[0-9a-z]+$/gi)?.[0]?.toLocaleLowerCase() ?? ""
                if (!format.includes(extension)) {
                //throw
                }
                cb(null, nanoid() + extension)
            }
        })

        const upload = multer({ storage: storage })

        const uploadPromise = deferred()
        upload.single('file')(req, res, uploadPromise.defer())
        await uploadPromise
        console.log(req.body.id)
        res.json(req.file)
    }
}