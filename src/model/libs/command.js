"use strict"

const { attemptP } = require("fluture")
const fresolve = require("fluture").resolve
const freject = require("fluture").reject
const { cloneDeep, flow } = require("lodash")
const { Right, Left, map, either, chain, I } = require("sanctuary")
const Ajv = new require("ajv")
const ajv = Ajv({ removeAdditional: "all" })
/**
getDeviceRelatedSubtable :: ObjectionClass a => a -> Future Error b  
*/
const getSubtableAllData = objectionTableClass => attemptP(objectionTableClass.query())
/**
getDeviceRelatedSubtable :: ObjectionClass a => a -> Future Error b  
*/
const getDeviceRelatedSubtableByCatId = objectionTableClass => id => attemptP(
    objectionTableClass.query().joinRelated("device.category").where("category.id", id).select(objectionTableClass.tableName + ".*")
)
/**
getDeviceRelatedSubtable :: ObjectionClass a => a -> integer -> Future Error b  
*/
const getDeviceRelatedSubtable = objectionTableClass => id => id ? getDeviceRelatedSubtableByCatId(Manufacturer)(id) : getSubtableAllData(Manufacturer)
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
module.exports.getSubtableAllData = getSubtableAllData
module.exports.getDeviceRelatedSubtable = getDeviceRelatedSubtable