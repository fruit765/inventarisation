"use strict"

const { send, getTable, sendP, getDevWithVirtualStatus } = require("./model/libs/command")
const devices = require('./routes/devices')
const categories = require('./routes/categories')
const users = require('./routes/users')
const suppliers = require('./routes/suppliers')
const brands = require('./routes/brands')
const login = require('./routes/login')
const command = require('./routes/command')
const post_dep_loc_united = require('./routes/post_dep_loc_united')
const dep_loc_united = require('./routes/dep_loc_united')

const accounts = require('./routes/accounts')
const account_types = require('./routes/account_types')
const accounts_owner = require('./routes/account_owners')
const events = require('./routes/events')

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
    app.use(post_dep_loc_united)
    app.use(dep_loc_united)

    app.use(accounts)
    app.use(account_types)
    app.use(accounts_owner)

    app.use(events)

    class Test {
        constructor() {
            this.a = 0
        }
    }

    const test1 = new Test
    app.get("/test", async (req, res, next) => {
        test1.a++
        console.log(test1.a)
        res.send("2")
    })

    app.use((err, req, res, next) => {
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        })
    })
}