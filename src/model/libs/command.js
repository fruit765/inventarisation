"use strict"

const { fork, attemptP } = require("fluture")
const fp = require("lodash/fp")
const { valueError, packError } = require("./exceptionHandling")

const send = next => res => promise => promise.then((x) => res.json(x)).catch(valueError(next))
const sendTest = next => res => promise => fork(valueError(next))((x) => res.json(x))(promise)

const getTableTest = objectionTableClass =>
    attemptP(() => objectionTableClass.query())

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

module.exports = { getTable, send, insertTable, updateTable, deleteTable, getTableTest, sendTest }
