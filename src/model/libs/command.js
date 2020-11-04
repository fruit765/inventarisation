"use strict"

const F = require("fluture")
const fp = require("lodash/fp")
const S = require("sanctuary")
const Ajv = new require("ajv")
const ajv = Ajv({ removeAdditional: "all" })

/**
*Получает все поля из таблицы
*getTabAllData :: ObjectionClass a => a -> Future Error b  
*/
const getTabAllData = objectionTableClass => F.attemptP(objectionTableClass.query())

/**
cutPropsInObjByJson :: (jsonSchema a) => a -> Object -> Either Error Object
*/
const cutPropsInObjByJson = jsonSchema => incObj => {
    const cloneObj = cloneDeepWith(incObj)
    const valid = ajv.compile(jsonSchema)(cloneObj)
    return valid ? Right(cloneObj) : Left(valid.errors)
}
/**
eitherToFluture :: (Either a, Fluture b) => a -> b
 */
const eitherToFluture = either(freject)(fresolve)

module.exports.eitherToFluture = eitherToFluture
module.exports.cutPropsInObjByJson = cutPropsInObjByJson
module.exports.getTabAllData = getTabAllData
module.exports.getDevRelatedTabValue = getDevRelatedTabValue