import createError from 'http-errors'
export class CreateErr {

    /**Создает ошибку похожую на формат ошибки Ajv для унификации */
    private createException(errCode: number, message: string, dataPath: string) {
        const buildMessage = [{
            dataPath: "." + dataPath,
            message: message
        }]
        const err = createError(errCode, buildMessage)
        return err
    }

    /**Ошибка пустого id */
    idEmpty() {
        return this.createException(400, "id must be not empty", "id")
    }

    /**Неверный id*/
    idWrong() {
        return this.createException(400, "wrong id", "id") 
    }

    /**серверная ошибка */
    internalServerError() {
        return createError(500, "InternalServerError")
    }
}