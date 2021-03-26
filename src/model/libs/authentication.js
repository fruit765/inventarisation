"use strict"

const Password = require("../orm/password")
const User = require("../orm/user")
const LocalStrategy = require("passport-local").Strategy

const { handleCustomError } = require("./exceptionHandling")

function getAuthUserDataById(id) {
    return User
        .query()
        .findById(id)
        .joinRelated("role")
        .select("user.*", "role")
}

function checkLoginPassword(login, password) {
    return Password
        .query()
        .first()
        .joinRelated("user")
        .where("login", login)
        .then(async x => x && await x.verifyPassword(password) ? x : false)
}

function serializeUser(user, done) {
    return done(null, user.id)
}

function deserializeUser(id, done) {
    return getAuthUserDataById(id)
        .then(x => x ? x : false)
        .then(x => done(null, x))
        .catch(handleCustomError("deserializeUser")(done))
}

const localStrategy = new LocalStrategy(
    { usernameField: 'login' },
    async (login, password, done) =>
        checkLoginPassword(login, password)
            .then(async x => x ?
                done(null, await getAuthUserDataById(x.id)) :
                done(null, false)
            )
            .catch(handleCustomError("localStrategy")(done))
)

module.exports = {
    localStrategy,
    deserializeUser,
    serializeUser
}