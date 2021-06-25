import { Transaction } from 'knex'
import { FacadeTable } from "./facadeTable"
import _ from "lodash"
import knex from '../orm/knexConf'
import { customAlphabet } from 'nanoid'
import multer from 'multer'
import fs from 'fs'
//@ts-ignore
import { deferred } from 'promise-callbacks'
import { sendP } from '../libs/command'
import MentoringPlan from '../class/mentoringPlan/MentoringPlan'
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

    /**Создание или редактирование плана*/
    async createPlan(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirm(data.id, trxOpt)
        if (!currentMentoring[0]) {
            throw this.handleErr.mentoringIdNotFound()
        }

        if (currentMentoring[0]?.status != "noplan" && currentMentoring[0]?.status != "plancreated") {
            throw this.handleErr.statusMustBeNoplanOrPlancreated()
        }
        // this.delete
        const planCreatedStatusId = await knex("status").where("status", "plancreated").first().then((x: { id: number }) => x.id)
        const Plan = new MentoringPlan(data?.plan, data.id)
        await Plan.fileCheck()
        //console.log(Plan.get())
        console.log(Plan.getAllFileName())
        return super.patchAndFetch({ plan: Plan.get(), id: data.id, status_id: planCreatedStatusId }, trxOpt)
    }

    /**Создание или редактирование плана*/
    async mentorGrade(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirm(data.id, trxOpt)
        if (!currentMentoring[0]) {
            throw this.handleErr.mentoringIdNotFound()
        }

        // if (currentMentoring[0]?.status != "planconfirmed" ) {
        //     throw this.handleErr.statusMustBePlanconfirmed()
        // }

        const Plan = new MentoringPlan(_.merge(currentMentoring[0]?.plan, data?.plan), data.id)

        return super.patchAndFetch({ plan: Plan.get(), id: data.id}, trxOpt)
    }

    /**Отправка ответов на тесты и задания для стажера */
    async protegeFill(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirm(data.id, trxOpt)
        if (!currentMentoring[0]) {
            throw this.handleErr.mentoringIdNotFound()
        }
        // if (currentMentoring[0]?.status != "planconfirmed" ) {
        //     throw this.handleErr.statusMustBePlanconfirmed()
        // }
        const Plan = new MentoringPlan(_.merge(currentMentoring[0]?.plan, data?.plan), data.id)
        return super.patchAndFetch({ plan: Plan.get(), id: data.id }, trxOpt)
    }

    /**Подтверждаем план*/
    async acceptPlan(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirm(data.id, trxOpt)
        if (!currentMentoring[0]) {
            throw this.handleErr.mentoringIdNotFound()
        }
        if (currentMentoring[0]?.status != "plancreated") {
            throw this.handleErr.statusMustBePlancreated()
        }
        const planCreatedStatusId = await knex("status").where("status", "planconfirmed").first().then((x: { id: number }) => x.id)
        return super.patchAndFetch({ ...data, status_id: planCreatedStatusId }, trxOpt)
    }

    /**Загрузка файлов которые будут использоваться в наставничистве */
    async fileLoad(req: any, res: any, next: any) {
        //const format = [".gif", ".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp", ".png", ".svg", ".webp"]
        const storage = multer.diskStorage({
            destination: async function (reqx, file, cb) {
                let path = "./uploaded/mentoring/" + reqx.query.id
                if (!fs.existsSync(path)) {
                    await fsPromises.mkdir(path, { recursive: true })
                }
                cb(null, path)
            },
            filename: function (reqx, file, cb) {
                const extension = file.originalname?.match(/\.[0-9a-z]+$/gi)?.[0]?.toLocaleLowerCase() ?? ""
                cb(null, nanoid() + extension)
            }
        })

        const upload = multer({
            storage: storage,
            limits: {
                fileSize: 10485760,
                headerPairs: 1
            }
        })

        const uploadPromise = deferred()
        upload.single('file')(req, res, uploadPromise.defer())
        await uploadPromise
        sendP(next)(res)(req.file)
    }
}