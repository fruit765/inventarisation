"use strict"

const Ajv = require('ajv')
const SwaggerParser = require("@apidevtools/swagger-parser")
const fp = require('lodash/fp')
const transform = require("lodash/fp/transform").convert({ 'cap': false })
const forIn = require("lodash/fp/forIn").convert({ 'cap': false })
const createError = require('http-errors')

// проверка параметров пути не реализованна
class OpenApiValid {

    constructor(options) {
        this.options = options
        this.ajv = new Ajv(options.validateRequests)
        this._addKeyword()
        this._parseOApi()
    }

    _parseOApi() {
        this.rawOApiObjPromise = SwaggerParser.validate(this.options.apiSpec)
    }

    _addKeyword() {
        forIn((value, key) => {
            this.ajv.addKeyword(key, {
                async: true,
                validate: value
            })
        })(this.options.addKeywords)
    }

    _makeQueryJSchema(oApiMethodBlock) {
        const paramsInQuery = fp.flow(
            fp.get("parameters"),
            fp.filter({ in: "query" }),
            fp.filter(x => x.schema) //не работает с content, исключаем
        )(oApiMethodBlock)

        if (fp.isNil(paramsInQuery[0])) {
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

    _makeReqBodyJSchema(oApiMethodBlock) {
        return fp.get("requestBody.content.application/json.schema")(oApiMethodBlock)
    }

    _validate(ajvValidator, object, next) {
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

    makeReqValidatorsObj() {
        this.reqValidatorsObjPromise = this.rawOApiObjPromise.then(
            rawOApiObj => fp.mapValues(
                fp.mapValues((oApiMethodBlock) => {
                    const req = {}
                    const queryJSchema = this._makeQueryJSchema(oApiMethodBlock)
                    const bodyJSchema = this._makeReqBodyJSchema(oApiMethodBlock)

                    if (bodyJSchema) {
                        bodyJSchema["$async"] = true
                        req.body = this.ajv.compile(bodyJSchema)
                    }

                    if (queryJSchema) {
                        queryJSchema["$async"] = true
                        req.query = this.ajv.compile(queryJSchema)
                    }

                    return Object.keys(req).length ? { req } : undefined
                }))(fp.mapKeys(fp.toLower)(rawOApiObj.paths))
        )
        return this
    }

    buildExpressMw() {
        return (req, res, next) => {
            return this.reqValidatorsObjPromise
                .then(validatorsObj => {
                    const validPathBlock = fp.get(`${req.path.toLocaleLowerCase()}`)(validatorsObj)

                    if (!validPathBlock) {
                        return next(new createError.NotFound())
                    }

                    const validReqBlock = fp.get(`${req.method.toLocaleLowerCase()}.req`)(validPathBlock)

                    if (!validReqBlock) {
                        return next(new createError.MethodNotAllowed())
                    }
                    this._validate(validReqBlock.query, req.query, next)
                    this._validate(validReqBlock.body, req.body, next)
                })
        }
    }
}

const openApiValidator = (options) => {
    const openApiValid = new OpenApiValid(options)
    return openApiValid.makeReqValidatorsObj().buildExpressMw()
}

module.exports = openApiValidator