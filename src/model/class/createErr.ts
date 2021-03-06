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

    /**Нет такой категории ПО */
    wrongSoftwareCategory() {
        return this.createException(400, "wrong software category", "software_category_id")
    }

    /**Название статуса не найдено*/
    statusNameNotFound() {
        return this.createException(400, "status name not found", "status")
    }

    /**Статус должен быть noplan или plancreated */
    statusMustBeNoplanOrPlancreated() {
        return this.createException(400, "status must be noplan or plancreated", "id")
    }

    /**Статус должен быть plancreated */
    statusMustBePlancreated() {
        return this.createException(400, "status must be plancreated", "id")
    }

    /**Статус должен быть planconfirmed */
    statusMustBePlanconfirmed() {
        return this.createException(400, "status must be planconfirmed", "id")
    }

    /**Нет записи в таблице mentoring с таким id */
    mentoringIdNotFound() {
        return this.createException(400, "this id was not found in the mentoring table", "id")
    }

    /**Не верный путь в плане/он не может быть использован в этом плане*/
    mentoringIncorrectPath(path: string) {
        return this.createException(400, "incorrect path: " + path, "plan")
    }

    /**Не верное имя файла в плане*/
    mentoringIncorrectFileName() {
        return this.createException(400, "incorrect file name", "plan")
    }

    /**Такого файла не существует*/
    mentoringFileNotFound(file: string) {
        return this.createException(400, "file not found: " + file, "plan")
    }

    /**Ожидает изображение*/
    mentoringAwaitingImage(file: string) {
        return this.createException(400, "the file: " + file + ", must have image format .gif, .jpg, .jpeg, .jfif, .pjpeg, .pjp, .png, .svg, .webp", "plan")
    }

    /**Стажер должен ответить на все вопросы */
    mentoringAllQuestionsNeedToBeAnswered() {
        return this.createException(400, "all questions need to be answered", "plan")
    }

    /**В тесте в вопросе должен быть хотябы один правильный ответ */
    mentoringRequiredAtLeastOneCorrectAnswer() {
        return this.createException(400, "at least one correct answer in a test question is required", "plan")
    }

    mentoringPlanCannotBeCompleted() {
        return this.createException(400, "the plan cannot be completed", "plan")
    }

    mentoringGradeRange() {
        return this.createException(400, "grade must be in the range from 0 to 100", "plan")
    }

    mentoringNeedStartTest() {
        return this.createException(400, "you need to run the test first", "plan")
    }

}