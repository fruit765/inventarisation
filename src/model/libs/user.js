"use strict"

const { getTable, insertTable, updateTable } = require("./command")
const User = require("../orm/user")

const getUsers = getTable(User)
const insertUsers = insertTable(User)
const updateUsers = updateTable(User)

module.exports = {
    getUsers,
    insertUsers,
    updateUsers
}