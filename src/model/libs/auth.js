"use strict"

const fp = require("lodash/fp")
const Credentials = require("../orm/credentials")
const LocalStrategy = require("passport-local").Strategy

const { packError, valueError, handleCustomError } = require("./exceptionHandling")

const getAuthUserDataById = id =>
    Credentials
        .query()
        .findById(id)
        .joinRelated("role")
        .select("credentials.id", "login", "role")
        .catch(packError("getAuthUserDataById"))

const checkLoginPassword = login => password =>
    Credentials
        .query()
        .first()
        .where("login", login)
        .then(async x => x && await x.verifyPassword(password) ? x : false)
        .catch(packError("checkLoginPassword"))

const serializeUser = function (user, done) {
    done(null, user.id)
}

const deserializeUser = function (id, done) {
    getAuthUserDataById(id)
        .then(x => x ? x : false)
        .then(x => done(null, x))
        .catch(handleCustomError("deserializeUser")(done))
}

const localStrategy = new LocalStrategy(
    { usernameField: 'login' },
    async (login, password, done) =>
        checkLoginPassword(login)(password)
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