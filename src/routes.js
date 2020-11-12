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
    updateDevices
} = require("./model/libs/device")

const F = require("fluture")
const fp = require("lodash/fp")
const { send } = require("./model/libs/command")

module.exports = function (app) {

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

    app.use((err, req, res, next) => {
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        })
    })
}