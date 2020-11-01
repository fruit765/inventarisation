
'use strict'

const express = require("express")
const app = express()
const port = require("../serverConfig").server.port

require("./middlewares")(app)
require("./routes.js")(app)


app.listen(port)``