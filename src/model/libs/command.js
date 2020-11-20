"use strict"

const fp = require("lodash/fp")
const { valueError, packError } = require("./exceptionHandling")

const send = next => res => promise => promise.then((x) => res.json(x)).catch(valueError(next))

const getTable = objectionTableClass =>
    objectionTableClass.query().catch(packError("getTable: " + objectionTableClass.tableName))

const insertTable = objectionTableClass => data =>
    objectionTableClass.query().insertAndFetch(data)
        .catch(packError("insertTable: " + objectionTableClass.tableName))

const updateTable = objectionTableClass => data =>
    objectionTableClass.query().findById(data.id).patch(fp.omit("id")(data)).then(() => data)
        .catch(packError("updateTable: " + objectionTableClass.tableName))

const deleteTable = objectionTableClass => id =>
    objectionTableClass.query().deleteById(id).then(() => id)
        .catch(packError("deleteTable: " + objectionTableClass.tableName))

module.exports = { getTable, send, insertTable, updateTable, deleteTable }
