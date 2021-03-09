"use strict"

const { send, getTable, sendP } = require("./model/libs/command")
const devices = require('./routes/devices')
const categories = require('./routes/categories')
const users = require('./routes/users')
const suppliers = require('./routes/suppliers')
const brands = require('./routes/brands')
const login = require('./routes/login')
const command = require('./routes/command')
const post_dep_loc_united = require('./routes/post_dep_loc_united')
const dep_loc_united = require('./routes/dep_loc_united')
const deviceAction = require('./routes/deviceAction')
const employers = require('./routes/employers')
const locations = require('./routes/locations')
const posts = require('./routes/posts')
const dep_loc = require('./routes/dep_loc')
const post_dep_loc = require('./routes/post_dep_loc')

const accounts = require('./routes/accounts')
const account_types = require('./routes/account_types')
const accounts_owner = require('./routes/account_owners')
const events = require('./routes/events')

const Status = require("./model/orm/status")
const Location = require("./model/orm/location")
const History = require("./model/orm/history")

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
    app.use(deviceAction)

    app.use(posts)
    app.use(employers)
    app.use(locations)
    app.use(post_dep_loc_united)
    app.use(dep_loc_united)
    app.use(dep_loc)
    app.use(post_dep_loc)

    app.use(accounts)
    app.use(account_types)
    app.use(accounts_owner)

    app.use(events)

    app.get("/test", async (req, res, next) => {
        const a = History.query()
        console.log(a)
    })

    app.use((err, req, res, next) => {
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        })
    })
}