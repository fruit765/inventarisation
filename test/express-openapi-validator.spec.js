"use strict"

const expect = chai.expect
const openApiValid = require("../src/model/libs/express-openapi-validator")
const fs = require('fs')

function createOApiFile(oApiPaths) {
    const oApitemplate = 
  `openapi: 3.0.0
    info:
      title: test
      version: '1.0'
      contact:
        name: test
      description: test
      license:
        name: test
        url: test
      termsOfService: test
    servers:
      - url: 'http://localhost:3000'
        description: test
    paths:
      ${oApiPaths}
    components:
      schemas: {}
    tags:
      - name: test`

    fs.writeFileSync("test/oApi.yaml", oApitemplate)
}

describe("express-openapi-validator", function () {
    it("", function () {
        openApiValid()
    })
})