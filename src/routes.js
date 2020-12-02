"use strict"

const { send, getTable } = require("./model/libs/command")
const devices = require('./routes/devices')
const categories = require('./routes/categories')
const users = require('./routes/users')
const suppliers = require('./routes/suppliers')
const brands = require('./routes/brands')
const login = require('./routes/login')
const command = require('./routes/command')
const Status = require("./model/orm/status")
const Location = require("./model/orm/location")

module.exports = function (app) {

    app.post("/credentials", (req, res, next) => {
        send(next)(res)(insertCredentials(req.body))
    })

    app.get("/statuses", (req, res, next) => {
        send(next)(res)(getTable(Status))
    })

    app.get("/locations", (req, res, next) => {
        send(next)(res)(getTable(Location))
    })

    app.use(login)
    app.use(brands)
    app.use(suppliers)
    app.use(devices)
    app.use(categories)
    app.use(users)
    app.use(command)

    app.use((err, req, res, next) => {
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        })
    })
}