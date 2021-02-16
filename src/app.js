
'use strict'

const express = require("express")
const app = express()
const port = require("../serverConfig").server.port
const prefix = require("../serverConfig").server.prefix
const router = express.Router()
const helmet = require("helmet")

app.use(helmet())

require("./middlewares")(router)
require("./routes.js")(router)

app.use('/'+prefix, router)
app.listen(port)