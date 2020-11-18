"use strict"

const fp = require("lodash/fp")
const winston = require("winston")
const { server } = require("../../../serverConfig")

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: "server.log",
            maxsize: "10000000",
            maxFiles: "1",
            tailable: true
        })
    ]
})

/**
 * Создает обьект содержащий новое название пользовательской ошибки, и старый объект ошибки.
 * В случае если функция сама получит такой объект она просто прокинет ее дальше, не внеся изменений.
 */
const packError = customErrName => err => {
    if (err.customErr) {
        return Promise.reject(err)
    } else {
        const newError = {}
        newError.customErr = new Error(customErrName)
        newError.originalErr = err
        return Promise.reject(newError)
    }
}

/**
 * Обрабатывает запакованные ошибки, полную ошибку отправляет в лог, колбэк получает пользовательскую ошибку
 */
const valueError = callback => err => {
    const callbackResponse = fp.flow(
        fp.omit("originalErr"),
        callback
    )(err)
    logger.error("gghg")
    return callbackResponse
}

module.exports = { packError, valueError } 