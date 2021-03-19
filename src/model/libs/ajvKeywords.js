//@ts-check
"use strict"

const dayjs = require("dayjs")
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const keywords = [
    ["x-json",
        {
            async: true,
            type: "number",
            modifying: true,
            validate:
            /**
             * Операции с JSON
             * stringify - переводит объект в json
             * parse - переводчит json в объект
             * @param {string} keywordValue 
             * @param {*} data 
             * @param {*} jssch 
             * @param {*} gpth 
             * @param {*} objData 
             * @param {string} keyData 
             */
                (keywordValue, data, jssch, gpth, objData, keyData) => {
                    if (keywordValue === "stringify") {
                        objData[keyData] = JSON.stringify(data)
                    } else if (keywordValue === "parse") {
                        try {
                            objData[keyData] = JSON.parse(data)
                        } catch {
                            objData[keyData] = undefined
                        }
                    }
                    return true
                }
        }
    ],
    ["x-date-to-iso",
        {
            modifying: true,
            //async: true, если функция возвращает промис
            //type: "string", возможно задать тип к которому применится данный валидатор
            validate:
            /**
             * Преобразует дату в строке в формат ISO
             * "2021-03-02T21:30:26.177Z"
             * @param {boolean} keywordValue значение данного ключа, кастомного ключ/значения
             * @param {*} data значение к которому применяется этот кастомный ключ/значение
             * @param {*} jssch 
             * @param {*} gpth 
             * @param {*} objData весь валидируемый объект
             * @param {string} keyData ключ строки в которой уставновлен кастомный ключ/значение
             */
                (keywordValue, data, jssch, gpth, objData, keyData) => {
                    if (keywordValue && data != null) {
                        objData[keyData] = dayjs(data).utc(true).toISOString()
                    }
                    return true
                }
        }
    ],
    ["x-type",
        {
            /**
             * 
             * @param {*} keywordValue 
             * @param {*} data 
             * @param {*} jssch 
             * @param {*} gpth 
             * @param {*} objData 
             * @param {*} keyData 
             */
            validate:
                (keywordValue, data, jssch, gpth, objData, keyData) => {
                    if (keywordValue === "intOrNull") {
                        if (data === null || data === "null" || data === "") {
                            objData[keyData] = null
                        } else {
                            objData[keyData] = parseInt(String(Number(data)))
                        }
                    }

                    if (isNaN(objData[keyData])) {
                        throw new Error(keyData + " must be null or integer")
                    } else {
                        return true
                    }
                }
        }
    ]
]

/**
 * Привязывает все кастомные валидаторы как ajv
 * @param {*} ajv 
 */
function bindAllKeywords(ajv) {
    keywords.forEach(value => {
        ajv.addKeyword(...value)
    })
}

module.exports = {bindAllKeywords, keywords}