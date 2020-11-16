"use strict"

const { getTable } = require("./command")
const User = require("../orm/user")

const getUsers = getTable(User)

module.exports = {
    getUsers
}