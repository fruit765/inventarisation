const bodyParser = require("body-parser")
const OpenApiValidator = require("express-openapi-validator")

module.exports = function (app) {
    app.use(bodyParser.urlencoded({ extended: false }))

    app.use(
        OpenApiValidator.middleware({ apiSpec: "./openApi/apiSpec.v1.yaml" })
    )
}