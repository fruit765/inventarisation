"use strict"

const fp = require("lodash/fp")
const traverse = require("json-schema-traverse")
const Role = require("../orm/role")
const { handleCustomError } = require("./exceptionHandling")
const { getCell, validateDataBySchema } = require("./../libs/command")
const { fork, map, chain } = require("fluture")

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

const schemaPrepare = rawSchema => {
    return fp.flow(
        x => x ? x : { additionalProperties: false },
        addAdditionalPropertiesByDefault,
        fp.set("$async", true)
    )(rawSchema)
}

const authorizationRequestByGetFn = getSchemaByIdFn => (req, res, next) => {
    const result = fp.flow(
        getSchemaByIdFn,
        map(schemaPrepare),
        chain(schema => validateDataBySchema(schema)(getReqData(req)))
    )(req.user.role_id)

    return fork(handleCustomError("checkAuthorizationByRoleMlw")(next))
        (() => next())
        (result)
}

const authorizationRequest = authorizationRequestByGetFn(getCell(Role)("query_permission"))

module.exports = { authorizationRequest }