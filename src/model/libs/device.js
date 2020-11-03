const { attemptP } = require("fluture")
const fresolve = require("fluture").resolve
const { cloneDeep, flow } = require("lodash")
const { Right, Left, map, either, chain, ap, lift2 } = require("sanctuary")
const Device = require("../orm/device")
const { getDeviceRelatedSubtable, cutPropsInObjByJson, eitherToFluture } = require("./command")

function getDeviceAll() {
    return attemptP(
        Device.query().joinRelated("[supplier,location,manufacturer,category]")
            .select("device.id,parent_id,category_id,status,user_id,supplier,location,manufacturer,model,comments,price,isArchive,specifications,date_receipt,date_warranty")
    )
}

const getManufacturer = getDeviceRelatedSubtable(Manufacturer)
const getSupplier = getDeviceRelatedSubtable(Supplier)

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