"use strict"

const express = require("express")
const passport = require("passport")
const router = express.Router()
const fp = require("lodash/fp")

router.route("/login")
    .get((req, res) => {
        const response = req.isAuthenticated() ?
            { userId: req.user.id, isAuth: 1, role: req.user.role } :
            { userId: null, isAuth: 0, role: null }
        res.json(response)
    })
    .post(passport.authenticate('local'), (req, res) => {
        res.json({ userId: req.user.id, isAuth: 1, role: req.user.role })
    })
    .delete((req, res) => {
        req.session.destroy(() => {
            res.cookie("connect.sid", "", { expires: new Date(0) })
            res.json({ userId: null, isAuth: 0, role: null })
        })
    })

module.exports = router