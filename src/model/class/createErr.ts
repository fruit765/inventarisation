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
        
        const err: any = new Error()
        err.status = errCode
        err.message = buildMessage
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

    /**Связывание одного устройства с другим запрещено*/
    bindSubDevNotAllowed() {
        return this.createException(400, "bind SubDevice not allowed", "ids")
    }

    /**Нельзя открепить устройство одно от другого*/
    unbindSubDevNotAllowed() {
        return this.createException(400, "unbind SubDevice not allowed", "ids")
    }

    /**серверная ошибка */
    internalServerError(message: string = "InternalServerError") {
        return createError(500, message)
    }

    /**Прикрепление ПО уже существует */
    attachAlreadyExists() {
        return this.createException(400, "attachment already exist", "id")
    }

    /**Прикрепление ПО не существует */
    attachNotExist() {
        return this.createException(400, "attachment does not exist", "id")
    }

    /**Прикрепление ПО не разрешено */
    attachDisallowed() {
        return this.createException(400, "attachment disallowed", "id")
    }

    /**device_id не должен быть пустым */
    devIdMustNotBeEmpty() {
        return this.createException(400, "device id must not be empty", "device_id")
    }
}