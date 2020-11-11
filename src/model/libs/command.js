"use strict"

const F = require("fluture")
const fp = require("lodash/fp")
const S = require("sanctuary")
const Ajv = new require("ajv")
const ajv = Ajv({ removeAdditional: "all" })

const send = next => res => F.fork(next)(fp.bind(res.json, res))

/**
*Получает все поля из таблицы
*getTabAllData :: ObjectionClass a => a -> Future Error b  
*/
const getTable = objectionTableClass => F.attemptP(() => objectionTableClass.query())

const insertTable = objectionTableClass => data => F.attemptP(
    () => objectionTableClass.query().insert(data)
)

const updateTable = objectionTableClass => data => F.attemptP(
    () => objectionTableClass.query().findById(data.id).patch(fp.omit("id")(data)).then(() => data)
)

const deleteTable = objectionTableClass => id => F.attemptP(
    () => objectionTableClass.query().deleteById(id).then(() => id)
)

// /**
//  * Добовляет/редактирует данные в таблице, если отправлены данные с id будет произведенно редактирование
//  * если без будет произведенно добавление
//  * upsertTableRow :: a -> b -> Fluture reject resolve
//  */
// const upsertTableRow = objectionTableClass => data => F.attemptP(
//     () => objectionTableClass.transaction(
//         trx => objectionTableClass.query(trx).upsertGraph(data)
//     ))

// /**
//  * Вырезает данные из объекта по json schema
// *cutPropsFromObjByJson :: (jsonSchema a) => a -> Object -> Either Error Object
// */
// const cutPropsFromObjByJson = jsonSchema => incObj => {
//     const cloneObj = cloneDeepWith(incObj)
//     const valid = ajv.compile(jsonSchema)(cloneObj)
//     return valid ? Right(cloneObj) : Left(valid.errors)
// }
// /**
// eitherToFluture :: (Either a, Fluture b) => a -> b
//  */
// const eitherToFluture = S.either(F.reject)(F.resolve)

module.exports = { getTable, send, insertTable, updateTable, deleteTable }
