const { attemptP } = require("Fluture")
const Device = require("../orm/device")
const ajv = new require("ajv")()
const { getDeviceRelatedSubtable } = require("./command")

function getDeviceAll() {
    return attemptP(
        Device.query().joinRelated("[supplier,location,manufacturer,category]")
            .select("device.id,parent_id,category_id,status,user_id,supplier,location,manufacturer,model,comments,price,isArchive,specifications,date_receipt,date_warranty")
    )
}

const getManufacturer = getDeviceRelatedSubtable(Manufacturer)
const getSupplier = getDeviceRelatedSubtable(Supplier)

/**
bodyToDevData :: (reqBody a, deviceData b) => a -> Either Error b 
 */
const bodyToDevData = reqBody => ajv.compile(deviceJson)(reqBody)

/**
bodyToSpecData :: (reqBody a, specifications b) => a -> Either Error b 
 */
const bodyToSpecData = reqBody => 

const editDevice = id => deviceData => specifications => attemptP(
    Device.query().findById(id).patch(deviceData)
)

    const addDevice = deviceData => attemptP(Device.query().insert(deviceData))