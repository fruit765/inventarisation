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
        this._makeReqValidatorsObj()
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
            return null
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
        return fp.get("requestBody.content.application/json.schema")(oApiMethodBlock) || null
    }

    _validate(ajvValidator, object, next) {
        if (ajvValidator) {
            return ajvValidator(object)
                .then(x => true)
                .catch(err => {
                    if (err instanceof Ajv.ValidationError) {
                        next(new createError.BadRequest(err.errors))
                    } else {
                        next(err)
                    }
                })
        }
    }

    _makeReqValidatorsObj() {
        this.reqValidatorsObjPromise = this.rawOApiObjPromise.then(
            rawOApiObj => fp.mapValues(
                fp.mapValues((oApiMethodBlock) => {
                    const req = {}

                    const queryJSchema = this._makeQueryJSchema(oApiMethodBlock) || {
                        type: "object",
                        properties: {}
                    }

                    const bodyJSchema = this._makeReqBodyJSchema(oApiMethodBlock) || {
                        type: "object",
                        properties: {}
                    }

                    bodyJSchema["$async"] = true
                    req.body = this.ajv.compile(bodyJSchema)

                    queryJSchema["$async"] = true
                    req.query = this.ajv.compile(queryJSchema)

                    return { req }
                    
                }))(fp.mapKeys(fp.toLower)(rawOApiObj.paths))
        )
    }

    // _makeResValidatorsObj() {
    //     this.resValidatorsObjPromise = this.rawOApiObjPromise.then(
    //         rawOApiObj => fp.mapValues(
    //             fp.mapValues((oApiMethodBlock) => {
    //                 const req = {}
    //                 const queryJSchema = this._makeQueryJSchema(oApiMethodBlock)
    //                 const bodyJSchema = this._makeReqBodyJSchema(oApiMethodBlock)

    //                 if (bodyJSchema) {
    //                     bodyJSchema["$async"] = true
    //                     req.body = this.ajv.compile(bodyJSchema)
    //                 }

    //                 if (queryJSchema) {
    //                     queryJSchema["$async"] = true
    //                     req.query = this.ajv.compile(queryJSchema)
    //                 }

    //                 return Object.keys(req).length ? { req } : undefined
    //             }))(fp.mapKeys(fp.toLower)(rawOApiObj.paths))
    //     )
    // }

    buildExpressMw() {
        return (req, res, next) => {
            // this.resValidatorsObjPromise
            // const _json=res.json
            // res.json = function (x) {console.log(this.statusCode); _json.bind(this)(x)}
            this.reqValidatorsObjPromise
                .then(async validatorsObj => {
                    const validPathBlock = fp.get(`${req.path.toLocaleLowerCase()}`)(validatorsObj)

                    if (!validPathBlock) {
                        return next(new createError.NotFound())
                    }

                    const validReqBlock = fp.get(`${req.method.toLocaleLowerCase()}.req`)(validPathBlock)

                    if (!validReqBlock) {
                        return next(new createError.MethodNotAllowed())
                    }
                
                    const queryIsValid = await this._validate(validReqBlock.query, req.query, next)
                    const bodyIsValid = await this._validate(validReqBlock.body, req.body, next)
                    if (queryIsValid && bodyIsValid) {
                        next()
                    } 
                })
        }
    }
}

const openApiValidator = (options) => {
    const openApiValid = new OpenApiValid(options)
    return openApiValid.buildExpressMw()
}

module.exports = openApiValidator