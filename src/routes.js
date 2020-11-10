const { getBrandByCatId, upsertBrand } = require("./model/libs/device")
const F = require("fluture")
const fp = require("lodash/fp")
const { send } = require("./model/libs/command")

module.exports = function (app) {
    
    app.get("/getTable/:tableName", (req, res, next) => {
        send(next)(res)(getBrandByCatId(req.query.id))
    })

    app.use((err, req, res, next) => {
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        })
    })
}