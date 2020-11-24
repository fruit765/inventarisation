const sessionConf = require("../serverConfig").session
const corsConf = require("../serverConfig").cors
const dbConfig = require("../serverConfig").db

const session = require("express-session")
const express = require("express")
const KnexSessionStore = require('connect-session-knex')(session)
const OpenApiValidator = require("express-openapi-validator")
const cors = require('cors')
const Knex = require('knex')
const passport = require("passport")
const { serializeUser, deserializeUser, localStrategy } = require("./model/libs/auth")
const Role = require("./model/orm/role")
const fp = require("lodash/fp")
const createError = require('http-errors')
//const { map, encaseP, resolve, reject, fork } = require("Fluture")
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

    app.use((req, res, next) => {

        // encaseP(() => Role.query()
        //     .findById(req.user.role_id)
        //     .select(req.path.replace(/^\//, "")))
        //     .pipe(map(x => x[req.path.replace(/^\//, "")]))
        //     .pipe(map(x => x.allowed.includes("all") ? reject() : resolveresolve(x.allowed)))
        //     .pipe(map(map()))
        //     .pipe(fork
        //         (handleCustomError("kkk")(next))
        //         (fork
        //             (next)
        //             (fork
        //                 (handleCustomError("kkk")(next))
        //                 (next)
        //             )
        //         )
        //     )
        const accessDeniedError = createError(403, "Forbidden")

        Role.query()
            .findById(req.user.role_id)
            .select("query_permission")
            .then(x => x ? x : accessDeniedError)
            .then(x => !x[req.path.replace(/^\//, "")] && (x.other === "allow") ? next() : x)
            .then(x => !x[req.method] && (x.other === "allow") ? next() : x)
            .then(x => !x[req.method] ? accessDeniedError : x[req.method])
            .then(x => )

            .then(x => x[req.path.replace(/^\//, "")])
            .then(x => x.allowed.includes("all") ? next() : x.allowed)


        //     fp.cond([
        //     [fp.flow(fp.get("allowed"),fp.includes("all")),]
        // ]
        //     )

        //     x.allowed.includes(any))
    })

    app.use(
        OpenApiValidator.middleware({
            apiSpec: "./openApi/apiSpec.v1.yaml",
            validateSecurity: false
        })
    )

}