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

    private async getStatusIdByName(status: string) {
        const statusId = knex("status").where("status", status).first().then((x: { id: number }) => x.id)
        if (!statusId) {
            this.handleErr.statusNameNotFound()
        }
        return statusId
    }

    /**Добовляет данные в таблицу возвражает id записи */
    async insert(data: any, trxOpt?: Transaction<any, any>) {
        const noplanStatusId = await this.getStatusIdByName("noplan")
        return super.insert({ ...data, status_id: noplanStatusId, plan: null }, trxOpt)
    }

    /**Создание или редактирование плана*/
    async createPlan(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirmWithoutPath(data.id, trxOpt)
        if (!currentMentoring[0]) {
            throw this.handleErr.mentoringIdNotFound()
        }

        if (currentMentoring[0]?.status != "noplan" && currentMentoring[0]?.status != "plancreated") {
            throw this.handleErr.statusMustBeNoplanOrPlancreated()
        }
        // this.delete
        const planCreatedStatusId = await this.getStatusIdByName("plancreated")
        const plan = new MentoringPlan(currentMentoring[0]?.plan, data.id)
        plan.replace(data?.plan)
        await plan.checkFiles()
        await plan.deleteUnusedFiles()
        return this.patchAndFetch({ plan: plan.get(), id: data.id, status_id: planCreatedStatusId }, trxOpt)
    }

    /**Используется для ответов на тесты и задания и отценки их фактически редактирует подтвержденный план*/
    async patchConfirmPlan(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirmWithoutPath(data.id, trxOpt)
        if (!currentMentoring[0]) {
            throw this.handleErr.mentoringIdNotFound()
        }
        if (currentMentoring[0]?.status != "planconfirmed") {
            throw this.handleErr.statusMustBePlanconfirmed()
        }
        const plan = new MentoringPlan(currentMentoring[0]?.plan, data.id)
        plan.update(data?.plan)
        await plan.checkFiles()
        await plan.deleteUnusedFiles()
        return this.patchAndFetch({ plan: plan.get(), id: data.id }, trxOpt)
    }

    async setCompleteStatus(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirmWithoutPath(data.id, trxOpt)
        if (!currentMentoring[0]) {
            throw this.handleErr.mentoringIdNotFound()
        }

        if (currentMentoring[0]?.status != "planconfirmed") {
            throw this.handleErr.statusMustBePlanconfirmed()
        }
        const plan = new MentoringPlan(currentMentoring[0]?.plan, data.id)
        if (plan.isComplete()) {
            const statusComplete = await this.getStatusIdByName("complete")
            this.patch({ id: data.id, status_id: statusComplete })
        } else {
            throw this.handleErr.mentoringPlanCannotBeCompleted()
        }
    }

    /**Подтверждаем план*/
    async acceptPlan(data: any, trxOpt?: Transaction<any, any>) {
        const currentMentoring = await this.getUnconfirmWithoutPath(data.id, trxOpt)
        if (!currentMentoring[0]) {
            throw this.handleErr.mentoringIdNotFound()
        }
        if (currentMentoring[0]?.status != "plancreated") {
            throw this.handleErr.statusMustBePlancreated()
        }
        const planCreatedStatusId = await this.getStatusIdByName("planconfirmed")
        return this.patchAndFetch({ ...data, status_id: planCreatedStatusId }, trxOpt)
    }

    /**Загрузка файлов которые будут использоваться в наставничистве */
    async fileLoad(req: any, res: any, next: any) {
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
        upload.array('file')(req, res, uploadPromise.defer())
        await uploadPromise
        sendP(next)(res)(req.files)
    }

    async getUnconfirm(id?: number | number[], trxOpt?: Transaction<any, any>) {
        const unconfirm = await super.getUnconfirm(id, trxOpt)
        for (let value of unconfirm) {
            const planClass = new MentoringPlan(value.plan, value.id)
            if (planClass.isNeedWriteDB()) {
                await this.patch({ plan: planClass.get(), id: value.id }, trxOpt)
            }
            if (value.protege_id === this.actorId) {
                value.plan = planClass.getProtege()
            } else {
                value.plan = planClass.get()
            }
        }
        return unconfirm
    }

    /**Возвращает записи с неподтверденными данными как они есть, т. е. ссылки на файлы без путей*/
    async getUnconfirmWithoutPath(...x: any) {
        return super.getUnconfirm(...x)
    }
}