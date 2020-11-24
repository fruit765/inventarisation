"use strict"

const { resolve } = require("fluture")
const fp = require("lodash/fp")
const winston = require("winston")
const { consoleFormat } = require("winston-console-format")
const { log } = require("../../../serverConfig")

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.errors({ stack: true }),
        // winston.format.splat(),
        winston.format.json(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.File(log.file),
        new winston.transports.Console({
            ...{
                format: winston.format.combine(
                    winston.format.colorize({ all: true }),
                    winston.format.padLevels(),
                    consoleFormat({
                        inspectOptions: {
                            depth: Infinity,
                            colors: true,
                            maxArrayLength: Infinity,
                            breakLength: 120,
                            compact: Infinity,
                        },
                    })
                ),
            },
            ...log.console
        })
    ]
})


/**
 * Создает обьект содержащий новое название пользовательской ошибки, и старый объект ошибки.
 * В случае если функция сама получит такой объект она просто прокинет ее дальше, не внеся изменений.
 * Работает только с ошибками(объектами имеющими свойство stack), другие объекты будут пропущены
 */
const packError = customErrName => err => {
    return Promise.resolve(err)
        .then(x => x && x.stack ? x : Promise.reject(x))
        .then(x => {
            if (x.customErr) {
                x.path = x.path + " => " + customErrName
                return Promise.reject(x)
            } else {
                x.path = customErrName
                x.customErr = new Error(customErrName)
                return Promise.reject(x)
            }
        })
}

/**
 * Обрабатывает запакованные ошибки, полную ошибку отправляет в лог, колбэк получает пользовательскую ошибку
 * Если это не пользовательская ошибка передает ее в колбэк без изменений
 */
const valueError = callback => err => {
    if (x && x.stack) {
        logger.error(err)
        return callback(err.customErr)
    } else {
        return callback(err)
    }
}

/**
 * packError и valueError в одной функции
 */
const handleCustomError = customErrName => callback => err =>
    packError(customErrName)(err).catch(valueError(callback))

module.exports = { packError, valueError, handleCustomError } 