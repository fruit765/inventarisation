const sessionConf = require("../serverConfig").session
const corsConf = require("../serverConfig").cors
const dbConfig = require("../../serverConfig").db
const fp = require("lodash/fp")

const F = require("fluture")
const bodyParser = require("body-parser")
const OpenApiValidator = require("express-openapi-validator")
const cors = require('cors')
const Knex = require('knex')
const passport = require("passport")
const { getCredentialsData } = require("./model/libs/command")
const { fromPairs } = require("lodash")
const LocalStrategy = require("passport-local").Strategy

const knex = Knex(dbConfig)
const store = new KnexSessionStore({
    knex,
    tablename: 'sessions'
})

passport.serializeUser(function (user, done) {
    done(null, credentials.id)
})

passport.deserializeUser(async function (id, done) {
    return fp.flow(
        F.map(x => x ? x : null),
        F.fork()()
    )(getCredentialsData(id))

    F.map(x => x ? x : null)(getCredentialsData(id))

    getCredentialsData(id).map(user => {
        if (!user) user = null
        return done(null, user)
    })
})

passport.use(new LocalStrategy(
    { usernameField: 'login' },
    function (email, password, done) {
        checkLoginPassword(email, password).then((result) => {
            result ? done(null, result) : done("Unauthorized", false)
        })
    })
)

module.exports = function (app) {

    app.use(cors(corsConf))

    app.use(bodyParser.urlencoded({ extended: false }))

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

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(
        OpenApiValidator.middleware({ apiSpec: "./openApi/apiSpec.v1.yaml" })
    )
}