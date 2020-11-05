const { getBrand } = require("./model/libs/device")
const F = require("fluture")
const fp = require("lodash/fp")

module.exports = function (app) {

    // app.get("/getBrand/:id", (req, res, next) => {
    //     F.fork(console.log)(console.log)(getBrand(req.params.id))
    // })

    app.get("/getBrand", (req, res, next) => {
        F.fork(res.json)(fp.bind(res.send,res))(getBrand)
    })

    app.use((err, req, res, next) => {
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        })
    })
}