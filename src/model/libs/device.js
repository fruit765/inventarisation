"use strict"

const Device = require("../orm/device")
const Brand = require("../orm/brand")
const Supplier = require("../orm/supplier")
const { getTable, insertTable, updateTable, deleteTable, getTableTest } = require("./command")
const Category = require("../orm/category")
const Status = require("../orm/status")
const { packError } = require("./exceptionHandling")
const Responsibility = require("../orm/responsibility")

const getAllOrOnlyCatIdRelated = objectionTableClass => catId => {
    /**
    *Получает все поля из таблицы связанной с таблицей device и id категории 
    */
    const getDevRelatedTabValueAssociatedCatId = objectionTableClass => catId =>
        objectionTableClass.query()
            .joinRelated("device")
            .where("category_id", catId)
            .select(objectionTableClass.tableName + ".*")
            .catch(packError("getDevRelatedTabValueAssociatedCatId"))

    return catId ?
        getDevRelatedTabValueAssociatedCatId(objectionTableClass)(catId) :
        getTable(objectionTableClass)
}

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

const getStatuses = getTable(Status).then(x=>{console.log(1); return x})

const getDevices = getTableTest(Device)
const insertDevices = insertTable(Device)
const updateDevices = updateTable(Device)

const getWarehouseResponsible = Responsibility.query().select("id").where("warehouseResponsible", 1)

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
    updateDevices,
    getWarehouseResponsible
}
