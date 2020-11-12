"use strict"

const F = require("fluture")
const fp = require("lodash/fp")
const S = require("sanctuary")
const Device = require("../orm/device")
const Brand = require("../orm/brand")
const Supplier = require("../orm/supplier")
const { getTable, insertTable, updateTable, deleteTable } = require("./command")
const Category = require("../orm/category")
const Status = require("../orm/status")

/**
*Получает все поля из таблицы связанной с таблицей device и id категории 
*getDevRelatedTabValueAssociatedCatId :: ObjectionClass a => a -> Future Error b  
*/
const getDevRelatedTabValueAssociatedCatId = objectionTableClass => catId => F.attemptP(() =>
    objectionTableClass.query()
        .joinRelated("device")
        .where("category_id", catId)
        .select(objectionTableClass.tableName + ".*")
)

const getAllOrOnlyCatIdRelated = objectionTableClass => catId => catId ?
    getDevRelatedTabValueAssociatedCatId(objectionTableClass)(catId) :
    getTable(objectionTableClass)

const getBrands = getAllOrOnlyCatIdRelated(Brand)
const insertBrands = insertTable(Brand)
const updateBrands = updateTable(Brand)
const deleteBrands = deleteTable(Brand)

const getSuppliers = getAllOrOnlyCatIdRelated(Supplier)
const insertSuppliers = insertTable(Supplier)
const updateSuppliers = updateTable(Supplier)
const deleteSuppliers = deleteTable(Supplier)

const getCategories = getTable(Category)
const insertCategories = insertTable(Category)
const updateCategories = updateTable(Category)
const deleteCategories = deleteTable(Category)

const getStatuses = getTable(Status)

const getDevices = getTable(Device)
const insertDevices = insertTable(Device)
const updateDevices = updateTable(Device)

module.exports = {
    getBrands,
    insertBrands,
    updateBrands,
    deleteBrands,
    getSuppliers,
    insertSuppliers,
    updateSuppliers,
    deleteSuppliers,
    getCategories,
    insertCategories,
    updateCategories,
    deleteCategories,
    getStatuses,
    getDevices,
    insertDevices,
    updateDevices
}

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