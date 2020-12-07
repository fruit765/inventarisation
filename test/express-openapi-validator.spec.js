"use strict"

const expect = chai.expect
const openApiValid = require("../src/model/libs/express-openapi-validator")
const fs = require('fs')

function createOApiFile(oApiBlocks) {

    const oApitemplate =
    {
        "openapi": "3.0.0",
        "info": {
            "title": "test",
            "version": "1.0",
            "contact": {
                "name": "name"
            },
            "description": "test"
        },
        "servers": [
            {
                "url": "http://localhost:3000"
            }
        ],
        "paths": {
            "/test": {
                "get": {
                    "summary": "test",
                    "tags": [
                        "test"
                    ],
                    "responses": {
                        "200": {
                            "description": "OK",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "test": {
                                                "type": "string"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "operationId": "get-test",
                    "description": "test",
                    "parameters": oApiBlocks.parameters,
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": oApiBlocks.requestBody
                            }
                        }
                    }
                }
            }
        },
        "components": {
            "schemas": {}
        },
        "tags": [
            {
                "name": "test"
            }
        ]
    }

    fs.writeFileSync("test/oApi.yaml", JSON.stringify(oApitemplate))
}

describe("express-openapi-validator", function () {
    it("", function () {
        openApiValid()
    })
})