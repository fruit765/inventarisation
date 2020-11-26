"use strict"

const express = require('express')
const { getTable, insertTable, updateTable, send, deleteTable } = require('../model/libs/command')
const Category = require('../model/orm/category')
const router = express.Router()

router.route('/categories')
    .get((req, res, next) => {
        send(next)(res)(getTable(Category))
    })
    .post( (req, res, next) => {
        send(next)(res)(insertTable(Category)(req.body))
    })
    .patch((req, res, next) => {
        send(next)(res)(updateTable(Category)(req.body))
    })
    .delete((req, res, next) => {
        send(next)(res)(deleteTable(Category)(req.body.id))
    })

module.exports = router