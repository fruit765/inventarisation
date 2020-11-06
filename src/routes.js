const { getBrandByCatId, upsertBrand } = require("./model/libs/device")
const F = require("fluture")
const fp = require("lodash/fp")
const { send } = require("./model/libs/command")

module.exports = function (app) {
    
    app.get("/getBrand", (req, res, next) => {
        send(next)(res)(getBrandByCatId(req.query.id))
    })

    app.post("/upsertBrand", (req, res, next) => {
        send(next)(res)(upsertBrand(req.body))
    })

    app.get("/getSupplier", (req, res, next) => {
        send(next)(res)(getSupplierByCatId(req.query.id))
    })

    app.post("/upsertSupplier", (req, res, next) => {
        send(next)(res)(upsertSupplier(req.body))
    })

    app.get("/getCategory", (req, res, next) => {
        send(next)(res)(getCategory)
    })

    

    app.use((err, req, res, next) => {
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        })
    })
}