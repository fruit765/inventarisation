"use strict"

const fp = require("lodash/fp")
const traverse = require("json-schema-traverse")
const { Left } = require("sanctuary")
const Role = require("../orm/role")
const { handleCustomError } = require("./exceptionHandling")
const Ajv = require("ajv")

const getReqData = (request) => fp.set(
    `${request.path.replace(/^\//, "")}.${request.method}.req`,
    {
        body: request.body,
        query: request.query,
        params: request.params
    }
)({})

const addAdditionalPropertiesByDefault = (schema) => {
    traverse(
        schema,
        x => {
            if (x.type === "object" && !x.additionalProperties) x.additionalProperties = false
        }
    )
    return schema
}

const validateReqBySchema = (request) => (schema) => {
    const ajv = new Ajv()
    const validate = ajv.compile(schema)
    return validate(getReqData(request))
        .catch(
            err => (err instanceof Ajv.ValidationError) ?
                Left(err) :
                Promise.reject(err)
        )
}

const authorizationRequest = (req, res, next) => {
    Role.query()
        .findById(req.user.role_id)
        .select("query_permission")
        .then(fp.get("query_permission"))
        .then(x => x ? x : { additionalProperties: false })
        .then(addAdditionalPropertiesByDefault)
        .then(fp.set("$async", true))
        .then(validateReqBySchema(req))
        .then(() => next())
        .catch(handleCustomError("checkAuthorizationByRoleMlw")(next))
}

module.exports = { authorizationRequest }