"use strict"

const { fork, attemptP, encaseP, mapRej } = require("fluture")
const fp = require("lodash/fp")
const { valueError, packError } = require("./exceptionHandling")
const Ajv = require("ajv")
const { Left } = require("sanctuary")
const luxon = require('luxon')

const send = next => res => fluture => fork(valueError(next))((x) => res.json(x))(fluture)
const sendP = next => res => pomise => pomise.then((x) => res.json(x)).catch(valueError(next))

const dateToIso = dateString => luxon.DateTime.fromISO(dateString,{ zone: "UTC" }).toUTC().toISO()

const validateDataBySchema = (schema) => (data) => {
    const ajv = new Ajv()
    const validate = encaseP(ajv.compile(schema).bind(ajv))
    return mapRej(
        err => (err instanceof Ajv.ValidationError) ? Left(err) : err
    )(validate(data))
}

const getCell = objectionTableClass => cellName => cellId =>
    attemptP(() =>
        objectionTableClass.query()
            .findById(cellId)
            .select(cellName)
            .then(fp.get(cellName))
            .catch(packError(
                `getCell: 
                table: ${objectionTableClass.tableName},
                cellId: ${cellId},
                cellName: ${cellName}`
            ))
    )

const getTable = objectionTableClass =>
    attemptP(() =>
        objectionTableClass.query()
            .catch(packError("getTable: " + objectionTableClass.tableName))
    )

const insertTable = objectionTableClass => data =>
    attemptP(() =>
        objectionTableClass.query()
            .insertAndFetch(data)
            .catch(packError("insertTable: " + objectionTableClass.tableName))
    )

const updateTable = objectionTableClass => data =>
    attemptP(() =>
        objectionTableClass.query()
            .findById(data.id)
            .patch(fp.omit("id")(data))
            .then(() => data.specifications ? fp.set("specifications")(JSON.parse(data.specifications))(data) : data)
            .catch(packError("updateTable: " + objectionTableClass.tableName))
    )

const deleteTable = objectionTableClass => id =>
    attemptP(() =>
        objectionTableClass.query()
            .deleteById(id)
            .then(() => id)
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

module.exports = { validateDataBySchema, getTable, getCell, send, sendP, insertTable, updateTable, deleteTable, getDevRelatedTabValueAssociatedCatId, dateToIso }
