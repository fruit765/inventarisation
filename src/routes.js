const { getBrandByCatId, upsertBrand } = require("./model/libs/device")
const F = require("fluture")
const fp = require("lodash/fp")
const { send } = require("./model/libs/command")

module.exports = function (app) {
    
    app.get("/brands", (req, res, next) => {
        send(next)(res)(getBrands)
    })

    app.post("/brands", (req, res, next) => {
        send(next)(res)(insertBrands(req.body))
    })

    app.patch("/brands", (req, res, next) => {
        send(next)(res)(updateBrands(req.body))
    })

    app.delete("/brands", (req, res, next) => {
        send(next)(res)(deleteBrands(req.body.id))
    })

    app.get("/brands", (req, res, next) => {
        send(next)(res)(getBrands)
    })

    app.post("/brands", (req, res, next) => {
        send(next)(res)(insertBrands(req.body))
    })

    app.patch("/brands", (req, res, next) => {
        send(next)(res)(updateBrands(req.body))
    })

    app.delete("/brands", (req, res, next) => {
        send(next)(res)(deleteBrands(req.body.id))
    })

    app.use((err, req, res, next) => {
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        })
    })
}