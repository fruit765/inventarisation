"use strict"

const Credentials = require("../orm/credentials")
const LocalStrategy = require("passport-local").Strategy

const getAuthUserDataById = id => Credentials.query().findById(id).joinRelated("role").select("credentials.id","login","role")

const checkLoginPassword = login => password =>
    Credentials
        .query()
        .first()
        .where("login", login)
        .then(x => x ? x.verifyPassword(password) : false)

const serializeUser = function (user, done) {
    done(null, credentials.id)
}

const deserializeUser = function (id, done) {
    getAuthUserDataById(id)
        .then(x => x ? x : false)
        .then(x => done(null, x))
        .catch()

}

const localStrategy = new LocalStrategy(
    { usernameField: 'login' },
    (login, password, done) => checkLoginPassword(login, password)
        .then(x => x ?
            done(null, getAuthUserDataById(x.id)) :
            done(null, false)
        )
        .catch()
)

module.exports = {
    localStrategy,
    deserializeUser,
    serializeUser
}