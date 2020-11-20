"use strict"

const {
    getBrands,
    insertBrands,
    updateBrands,
    deleteBrands,
    getSuppliers,
    insertSuppliers,
    updateSuppliers,
    deleteSuppliers,
    getCategories,
    insertCategories,
    updateCategories,
    deleteCategories,
    getStatuses,
    getDevices,
    insertDevices,
    updateDevices,
    insertCredentials
} = require("./model/libs/device")
const passport = require("passport")
const { send } = require("./model/libs/command")
const { getUsers, updateUsers, insertUsers } = require("./model/libs/user")

module.exports = function (app) {

    app.post("/credentials", (req, res, next) => {
        send(next)(res)(insertCredentials(req.body))
    })

    app.get("/login", (req, res, next) => {
        const response = req.isAuthenticated() ?
            { userId: req.user.id, isAuth: 1, role: req.user.role } :
            { userId: null, isAuth: 0, role: null } 
        res.json(response)
    })

    app.post("/login", passport.authenticate('local'), (req, res, next) => {
        res.json({ userId: req.user.id, isAuth: 1, role: req.user.role })
    })

    app.delete("/login", (req, res, next) => {
        req.session.destroy(() => {
            res.cookie("connect.sid", "", { expires: new Date(0) })
            res.json({ userId: null, isAuth: 0, role: null })
        })
    })

    app.get("/brands", (req, res, next) => {
        send(next)(res)(getBrands(req.query.catId))
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

    app.get("/suppliers", (req, res, next) => {
        send(next)(res)(getSuppliers(req.query.catId))
    })

    app.post("/suppliers", (req, res, next) => {
        send(next)(res)(insertSuppliers(req.body))
    })

    app.patch("/suppliers", (req, res, next) => {
        send(next)(res)(updateSuppliers(req.body))
    })

    app.delete("/suppliers", (req, res, next) => {
        send(next)(res)(deleteSuppliers(req.body.id))
    })

    app.get("/categories", (req, res, next) => {
        send(next)(res)(getCategories)
    })

    app.post("/categories", (req, res, next) => {
        send(next)(res)(insertCategories(req.body))
    })

    app.patch("/categories", (req, res, next) => {
        send(next)(res)(updateCategories(req.body))
    })

    app.delete("/categories", (req, res, next) => {
        send(next)(res)(deleteCategories(req.body.id))
    })

    app.get("/statuses", (req, res, next) => {
        send(next)(res)(getStatuses)
    })

    app.get("/devices", (req, res, next) => {
        send(next)(res)(getDevices)
    })

    app.post("/devices", (req, res, next) => {
        send(next)(res)(insertDevices(req.body))
    })

    app.patch("/devices", (req, res, next) => {
        send(next)(res)(updateDevices(req.body.id))
    })

    app.get("/users", (req, res, next) => {
        send(next)(res)(getUsers)
    })

    app.post("/users", (req, res, next) => {
        send(next)(res)(insertUsers(req.body))
    })

    app.patch("/users", (req, res, next) => {
        send(next)(res)(updateUsers(req.body.id))
    })

    app.use((err, req, res, next) => {
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        })
    })
}