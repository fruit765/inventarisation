"use strict"

const F = require("fluture")
const fp = require("lodash/fp")
const S = require("sanctuary")
const Device = require("../orm/device")
const Brand = require("../orm/brand")
const Supplier = require("../orm/supplier")
const { getTabAllData, upsertTableRow } = require("./command")
const Category = require("../orm/category")
 
const getTable = tableName => getTabAllData(tableName)

// /**
// * Получает все поля из таблицы связанной с таблицей device и id категории, если catId пустой возвращает таблицу со всеми данными
// *getDevRelatedTabValue :: (ObjectionClass a, catId b) => a -> b -> Future Error c  
// */
// const getDevRelatedTabValue = objectionTableClass => catId => {

//     /**
//     *Получает все поля из таблицы связанной с таблицей device и id категории 
//     *getDevRelatedTabValueAssociatedCatId :: ObjectionClass a => a -> Future Error b  
//     */
//     const getDevRelatedTabValueAssociatedCatId = objectionTableClass => catId => F.attemptP(() =>
//         objectionTableClass.query()
//             .joinRelated("device")
//             .where("category_id", catId)
//             .select(objectionTableClass.tableName + ".*")
//     )

//     return catId ? getDevRelatedTabValueAssociatedCatId(objectionTableClass)(catId) : getTabAllData(objectionTableClass)
// }

// const getBrandByCatId = getDevRelatedTabValue(Brand)
// const upsertBrand = upsertTableRow(Brand)

// const getSupplierByCatId = getDevRelatedTabValue(Supplier)
// const upsertSupplier = upsertTableRow(Supplier)

// const getCategory = getTabAllData(Category)

// const getDevice = F.attemptP(() => {
//     Device.query()
//         .joinRelated("[brand, supplier, status, category, location]")
//         .select("device.id,parent_id,category_id,status,user_id,supplier,location,brand,model,comments,price,isArchive,specifications,date_receipt,date_warranty")
// })
// const getSupplier = getDevRelatedTabValue(Supplier)

// const getDeviceAll = attemptP(
//     Device.query()
//         .joinRelated("[supplier,location,manufacturer,category]")
//         .select("device.id,parent_id,category_id,status,user_id,supplier,location,manufacturer,model,comments,price,isArchive,specifications,date_receipt,date_warranty")
// )

// const parseSpecDataFromObjByCatIdOrDevId = catId => devId => parseObj => {
//     const getSpecJsonByCatId = id => attemptP(Category.query().findById(id).select("schema"))
//     const getSpecJsonByDevId = id => attemptP(Device.query().joinRelated("category").findById(id).select("schema"))
//     const schemaJson = catId ? getSpecJsonByCatId(catId) : getSpecJsonByDevId(devId)
//     const jsonData = lift2(cutPropsInObjByJson)(schemaJson)(resolve(parseObj))
//     return chain(eitherToFluture)(jsonData)
// }

// const editDevice = id => newData => {
//     const deviceData = cutPropsInObjByJson(deviceCommonJson)(newData)
//     parseSpecDataFromObjByCatIdOrDevId()()()
// }

// const addDevice = deviceData => attemptP(Device.query().insert(deviceData))

//module.exports = { getBrandByCatId, upsertBrand, getSupplierByCatId, upsertSupplier, getCategory }