const chai = require('chai')
const expect = chai.expect
const rewire = require("rewire")
const authorization = rewire('../../src/model/libs/authorization.js')
authorization.__set__("getCell", fsMock)

const genReq = (path, method, body, query, params) => {
    return {path, body, query, params, method}
} 

describe("authorizationRequest", function () {
    it("123", function() {
        const authorizationRequestByGetFn = authorization.__get__("authorizationRequestByGetFn")
    })
})