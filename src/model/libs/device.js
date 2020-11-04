const F = require("fluture")
const fp = require("lodash/fp")
const { Right, Left, map, either, chain, ap, lift2 } = require("sanctuary")
const Device = require("../orm/device")
const { getTabAllData } = require("./command")

/**
* Получает все поля из таблицы связанной с таблицей device и id категории, если catId пустой возвращает таблицу со всеми данными
*getDevRelatedTabValue :: (ObjectionClass a, catId b) => a -> b -> Future Error c  
*/
const getDevRelatedTabValue = objectionTableClass => catId => {

    /**
    *Получает все поля из таблицы связанной с таблицей device и id категории 
    *getDevRelatedTabValueAssociatedCatId :: ObjectionClass a => a -> Future Error b  
    */
    const getDevRelatedTabValueAssociatedCatId = objectionTableClass => catId => F.attemptP(
        objectionTableClass.query()
            .joinRelated("device.category")
            .where("category.id", catId)
            .select(objectionTableClass.tableName + ".*")
    )

    return catId ? getDevRelatedTabValueAssociatedCatId(objectionTableClass)(catId) : getTabAllData(objectionTableClass)
}

const getManufacturer = getDevRelatedTabValue(Manufacturer)
const getSupplier = getDevRelatedTabValue(Supplier)

const getDeviceAll = attemptP(
    Device.query()
        .joinRelated("[supplier,location,manufacturer,category]")
        .select("device.id,parent_id,category_id,status,user_id,supplier,location,manufacturer,model,comments,price,isArchive,specifications,date_receipt,date_warranty")
)

const parseSpecDataFromObjByCatIdOrDevId = catId => devId => parseObj => {
    const getSpecJsonByCatId = id => attemptP(Category.query().findById(id).select("schema"))
    const getSpecJsonByDevId = id => attemptP(Device.query().joinRelated("category").findById(id).select("schema"))
    const schemaJson = catId ? getSpecJsonByCatId(catId) : getSpecJsonByDevId(devId)
    const jsonData = lift2(cutPropsInObjByJson)(schemaJson)(resolve(parseObj))
    return chain(eitherToFluture)(jsonData)
}

const editDevice = id => newData => {
    const deviceData = cutPropsInObjByJson(deviceCommonJson)(newData)
    parseSpecDataFromObjByCatIdOrDevId()()()
}

const addDevice = deviceData => attemptP(Device.query().insert(deviceData))