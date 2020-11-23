const sessionConf = require("../serverConfig").session
const corsConf = require("../serverConfig").cors
const dbConfig = require("../serverConfig").db

const session = require("express-session")
const express = require("express")
const KnexSessionStore = require('connect-session-knex')(session)
const bodyParser = require("body-parser")
const OpenApiValidator = require("express-openapi-validator")
const cors = require('cors')
const Knex = require('knex')
const passport = require("passport")
const { serializeUser, deserializeUser, localStrategy } = require("./model/libs/auth")
const Role = require("./model/orm/role")
const fp = require("lodash/fp")
//const {} = require("monet")

const knex = Knex(dbConfig)
const store = new KnexSessionStore({
    knex,
    tablename: 'sessions'
})

module.exports = function (app) {

    app.use(cors(corsConf))

    app.use(express.json())

    app.use(
        session({
            secret: sessionConf.secret,
            store,
            cookie: {
                secure: sessionConf.secure,
                path: '/',
                httpOnly: true,
                maxAge: (60000 * sessionConf.maxAge)
            },
            rolling: true,
            resave: false,
            saveUninitialized: false
        })
    )

    passport.serializeUser(serializeUser)
    passport.deserializeUser(deserializeUser)
    passport.use(localStrategy)

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(/^(?!\/login)/, (req, res, next) => {
        const err = new Error("Unauthorized")
        err.status = 401
        req.isAuthenticated() ? next() : next(err)
    })

    // app.use((req, res, next) => {
    //     Role.query()
    //         .findById(req.user.role_id)
    //         .select(req.path.replace(/^\//, ""))
    //         .then(x => x[req.path.replace(/^\//, "")])
    //         .then(x => fp.cond([
    //             [fp.flow(fp.get("allowed"),fp.includes("all")),]
    //         ]
    //             )

    //             x.allowed.includes(any))
    // })

    app.use(
        OpenApiValidator.middleware({
            apiSpec: "./openApi/apiSpec.v1.yaml",
            validateSecurity: false
        })
    )

}