"use strict"

const Ajv = require('ajv')
const SwaggerParser = require("@apidevtools/swagger-parser")
const fp = require('lodash/fp')
const transform = require("lodash/fp/transform").convert({ 'cap': false })
const createError = require('http-errors')
const { handleCustomError } = require('./exceptionHandling')

// проверка параметров пути не реализованна

const makeQueryJSchema = oApiMethodBlock => {
    const paramsInQuery = fp.flow(
        fp.get("parameters"),
        fp.filter({ in: "query" }),
        fp.filter(x => x.schema) //не работает с content, исключаем
    )(oApiMethodBlock)

    if (fp.isNil(paramsInQuery)) {
        return undefined
    }

    const JSchema = transform((result, queryValue) => {
        if ((queryValue.required === true) ||
            (queryValue.required === "true")) {
            result.required.push(queryValue.name)
        }
        result.properties[queryValue.name] = queryValue.schema
    }, { "type": "object", required: [], properties: {} }, paramsInQuery)

    return JSchema
}

const makeReqBodyJSchema = fp.get("requestBody.application/json.schema")

const makeReqValidatorsObj = ajvImp => oApiObj => fp.mapValues(
    fp.mapValues((oApiMethodBlock) => {
        const req = {}
        const queryJSchema = makeQueryJSchema(oApiMethodBlock)
        const bodyJSchema = makeReqBodyJSchema(oApiMethodBlock)

        if (bodyJSchema) {
            bodyJSchema["$async"] = true
            req.body = ajvImp.compile(bodyJSchema)
        }

        if (queryJSchema) {
            queryJSchema["$async"] = true
            req.query = ajvImp.compile(queryJSchema)
        }

        return Object.keys(req).length ? { req } : undefined
    })
)(oApiObj.paths)

const validate = (ajvValidator, object, next) => {
    if (ajvValidator) {
        ajvValidator(object)
            .then(() => next())
            .catch(err => {
                if (err instanceof Ajv.ValidationError) {
                    return next(new createError.BadRequest(err.message))
                } else {
                    throw err
                }
            })
    }
}

const expressMwFn = validatorsObjPromise => (req, res, next) => {
    return validatorsObjPromise
        .then(validatorsObj => {
            const validPathBlock = fp.get(`${req.path.toLocaleLowerCase()}`)(validatorsObj)

            if (!validPathBlock) {
                return next(new createError.NotFound())
            }

            const validReqBlock = fp.get(`${req.method.toLocaleLowerCase()}.req`)(validPathBlock)

            if (!validReqBlock) {
                return next(new createError.MethodNotAllowed())
            }
 
            validate(validReqBlock.query, req.query, next)
            validate(validReqBlock.body, req.body, next)
        })
        .catch(handleCustomError("expressMwFn")(next))
}

const makeOApiObj = oApiPath => SwaggerParser.validate(oApiPath)

const openApiValid = (validOpt) => {
    const ajv = new Ajv()
    const validatorsObjPromise = makeOApiObj(validOpt.apiSpec).then(makeReqValidatorsObj(ajv))
    return expressMwFn(validatorsObjPromise)
}

module.exports = openApiValid