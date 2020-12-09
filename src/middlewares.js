const sessionConf = require("../serverConfig").session
const corsConf = require("../serverConfig").cors
const dbConfig = require("../serverConfig").db

const session = require("express-session")
const express = require("express")
const KnexSessionStore = require("connect-session-knex")(session)
const OpenApiValidator = require("express-openapi-validator")
const cors = require("cors")
const Knex = require("knex")
const passport = require("passport")
const { serializeUser, deserializeUser, localStrategy } = require("./model/libs/authentication")
const createError = require("http-errors")
const { authorizationRequest } = require("./model/libs/authorization")
const openApiValid = require("./model/libs/express-openapi-validator")

const knex = Knex(dbConfig)
const store = new KnexSessionStore({
    knex,
    tablename: "sessions"
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
                path: "/",
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
        req.isAuthenticated() ? next() : next(createError(403, "Unauthorized"))
    })

    app.use(/^(?!\/login)/, authorizationRequest)

    // app.use(
    //     OpenApiValidator.middleware({
    //         apiSpec: "./openApi/apiSpec.v1.yaml",
    //         //formats: [],
    //         validateSecurity: false,
    //         validateRequests: true,
    //         coerceTypes: true
    //     })
    // )

    app.use(
        openApiValid({
            apiSpec: "./openApi/apiSpec.v1.yaml",
            validateRequests: {
                removeAdditional: true,
                coerceTypes: true
            },
            addKeywords: {
                "x-json": (keywordValue, data, jssch, gpth, objData, keyData) => {
                    if (keywordValue === "stringify") {
                        objData[keyData] = JSON.stringify(data)
                    } else if (keywordValue === "parse") {
                        try {
                            objData[keyData] = JSON.parse(data)
                        } catch {
                            objData[keyData] = undefined
                        }
                    }

                    return true
                },

                "x-date": (keywordValue, data, jssch, gpth, objData, keyData) => {
                    if (keywordValue === "toIso") {
                        objData[keyData] = dateToIso(data)
                    } 
                    
                    return true
                }
            }
        })
    )

}