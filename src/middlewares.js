const sessionConf = require("../serverConfig").session
const corsConf = require("../serverConfig").cors
const dbConfig = require("../serverConfig").db

const session = require("express-session")
const express = require("express")
const KnexSessionStore = require("connect-session-knex")(session)
const cors = require("cors")
const Knex = require("knex")
const passport = require("passport")
const { serializeUser, deserializeUser, localStrategy } = require("./model/libs/authentication")
const createError = require("http-errors")
const { authorizationRequest } = require("./model/libs/authorization")
const openApiValidator = require("./model/libs/express-openapi-validator")
const { dateToIso } = require("./model/libs/command")

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

    app.use(
        openApiValidator({
            apiSpec: "./openApi/apiSpec.v1.yaml",
            validateRequests: {
                removeAdditional: "all",
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
                },

                "x-type": (keywordValue, data, jssch, gpth, objData, keyData) => {
                    if (keywordValue === "intOrNull") {
                        if (data === null || data === "null" || data === "") {
                            objData[keyData] = null
                        } else {
                            objData[keyData] = parseInt(Number(data))
                        }
                    }

                    if (isNaN(objData[keyData])) {
                        throw new Error(keyData+" must be null or integer")
                    } else {
                        return true
                    }
                }
            }
        })
    )

}