"use strict"

const fp = require("lodash/fp")
const { type, Left, either, mapLeft } = require("sanctuary")
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
 */
const packError = customErrName => err => {
    if (type(err).name === "Either") {
        err = mapLeft(x => fp.set("path", x.path + " => " + customErrName)(x))(err)
    } else {
        err.path = customErrName
        err.customErr = new Error(customErrName)
        err = Left(err)
    }

    return Promise.reject(err)
}

/**
 * Обрабатывает запакованные ошибки, полную ошибку отправляет в лог, колбэк получает пользовательскую ошибку
 */
const valueError = callback => err => {
    const logAndCallback = x => {
        logger.error(x)
        return callback(x)
    }

    if (type(err).name === "Either") {
        return either(logAndCallback)(callback)(err)
    } else {
        return logAndCallback(err)
    }
}

/**
 * packError и valueError в одной функции
 */
const handleCustomError = customErrName => callback => err =>
    packError(customErrName)(err).catch(valueError(callback))

module.exports = { packError, valueError, handleCustomError, logger } 