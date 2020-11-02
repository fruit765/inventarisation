"use strict"
/**getDeviceRelatedSubtable :: ObjectionClass a => a -> Future Error b  */
const getSubtableAllData = objectionTableClass => attemptP(objectionTableClass.query())
/**getDeviceRelatedSubtable :: ObjectionClass a => a -> Future Error b  */
const getDeviceRelatedSubtableByCatId = objectionTableClass => id => attemptP(
    objectionTableClass.query().joinRelated("device.category").where("category.id", id).select(objectionTableClass.tableName + ".*")
)
/**getDeviceRelatedSubtable :: ObjectionClass a => a -> integer -> Future Error b  */
const getDeviceRelatedSubtable = objectionTableClass => id => id ? getDeviceRelatedSubtableByCatId(Manufacturer)(id) : getSubtableAllData(Manufacturer)

module.exports.getSubtableAllData = getSubtableAllData
module.exports.getDeviceRelatedSubtable = getDeviceRelatedSubtable