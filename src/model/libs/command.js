"use strict"

const { fork, attemptP } = require("fluture")
const fp = require("lodash/fp")
const { valueError, packError } = require("./exceptionHandling")

const send = next => res => fluture => fork(valueError(next))((x) => res.json(x))(fluture)

const getTable = objectionTableClass =>
    attemptP(() =>
        objectionTableClass.query()
            .catch(packError("getTable: " + objectionTableClass.tableName))
    )

const insertTable = objectionTableClass => data =>
    attemptP(() =>
        objectionTableClass.query().insertAndFetch(data)
            .catch(packError("insertTable: " + objectionTableClass.tableName))
    )

const updateTable = objectionTableClass => data =>
    attemptP(() =>
        objectionTableClass.query().findById(data.id).patch(fp.omit("id")(data)).then(() => data)
            .catch(packError("updateTable: " + objectionTableClass.tableName))
    )

const deleteTable = objectionTableClass => id =>
    attemptP(() =>
        objectionTableClass.query().deleteById(id).then(() => id)
            .catch(packError("deleteTable: " + objectionTableClass.tableName))
    )

/**
*Получает все поля из таблицы связанной с таблицей device и id категории 
*/
const getDevRelatedTabValueAssociatedCatId = objectionTableClass => catId =>
    objectionTableClass.query()
        .joinRelated("device")
        .where("category_id", catId)
        .select(objectionTableClass.tableName + ".*")
        .catch(packError("getDevRelatedTabValueAssociatedCatId"))

module.exports = { getTable, send, insertTable, updateTable, deleteTable, getDevRelatedTabValueAssociatedCatId }
