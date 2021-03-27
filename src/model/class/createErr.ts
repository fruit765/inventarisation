import createError from 'http-errors'
export default class CreateErr {

    /**Создает ошибку */
    createError(...args: any[]) {
        return createError(...args)
    }

    /**Создает ошибку похожую на формат ошибки Ajv для унификации */
    private createException(errCode: number, message: string, dataPath: string) {
        const buildMessage = [{
            dataPath: "." + dataPath,
            message: message
        }]
        const err = createError(errCode, buildMessage)
        return err
    }

    /**Поле должно быть уникальным */
    mustBeUniq(dataPath: string) {
        return this.createException(400, "this value must be unique", dataPath)
    }

    /**Ошибка пустого id */
    idEmpty() {
        return this.createException(400, "id must be not empty", "id")
    }

    /**Неверный id*/
    idWrong() {
        return this.createException(400, "wrong id", "id")
    }

    /**Неверный user_id*/
    userIdWrong() {
        return this.createException(400, "wrong user_id", "user_id")
    }

    /**Неверный event композитный id*/
    eventIdWrong() {
        return this.createException(400, "wrong event id", "event_id")
    }

    /**серверная ошибка */
    internalServerError(message: string = "InternalServerError") {
        return createError(500, message)
    }
}