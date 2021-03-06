"use strict"

const { send, getTable, sendP } = require("./model/libs/command")

const devices = require('./routes/devices')
const categories = require('./routes/categories')
const users = require('./routes/users')
const suppliers = require('./routes/suppliers')
const brands = require('./routes/brands')
const login = require('./routes/login')
const command = require('./routes/command')
const userRights = require('./routes/userRights')
const subDevices = require('./routes/subDevices')
const post_dep_loc_united = require('./routes/post_dep_loc_united')
const dep_loc_united = require('./routes/dep_loc_united')
const deviceAction = require('./routes/deviceAction')
const employers = require('./routes/employers')
const locations = require('./routes/locations')
const posts = require('./routes/posts')
const dep_loc = require('./routes/dep_loc')
const post_dep_loc = require('./routes/post_dep_loc')
const departments = require('./routes/departments')
const role = require('./routes/role')

const accounts = require('./routes/accounts')
const softwares = require('./routes/softwares')
const softwareCategory = require('./routes/softwareCategory')
const softwareAction = require('./routes/softwareAction')
const software_owners = require('./routes/software_owners')
const account_types = require('./routes/account_types')
const accounts_owner = require('./routes/account_owners')
const events = require('./routes/events')
const eventAction = require('./routes/eventAction')

const mentoring = require('./routes/mentoring')
const mentoringProtege = require('./routes/mentoringProtege')
const mentoringMentor = require('./routes/mentoringMentor')
const mentoringFileLoad = require('./routes/mentoringFileLoad')

const Status = require("./model/orm/status")
const Location = require("./model/orm/location")

module.exports = function (app) {

    app.get("/statuses", (req, res, next) => {
        send(next)(res)(getTable(Status))
    })

    app.get("/locations", (req, res, next) => {
        send(next)(res)(getTable(Location))
    })

    app.use(login)
    app.use(brands)
    app.use(suppliers)
    app.use(devices)
    app.use(categories)
    app.use(users)
    app.use(command)
    app.use(userRights)
    app.use(subDevices)
    app.use(deviceAction)
    app.use(role)

    app.use(posts)
    app.use(employers)
    app.use(locations)
    app.use(post_dep_loc_united)
    app.use(dep_loc_united)
    app.use(dep_loc)
    app.use(post_dep_loc)
    app.use(departments)

    app.use(softwares)
    app.use(softwareCategory)
    app.use(softwareAction)
    app.use(software_owners)
    app.use(accounts)
    app.use(account_types)
    app.use(accounts_owner)
    app.use(eventAction)
    app.use(events)

    app.use(mentoring)
    app.use(mentoringProtege)
    app.use(mentoringMentor)
    app.use(mentoringFileLoad)

    app.post("/test", async (req, res, next) => {
        // const format = [".gif", ".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp", ".png", ".svg", ".webp"]
        // const storage = multer.diskStorage({
        //     destination: async function (reqx, file, cb) {
        //         let path = "./uploaded/mentoring/" + reqx.body.id
        //         if (!fs.existsSync(path)) {
        //             await fsPromises.mkdir(path, { recursive: true })
        //         }
        //         cb(null, path)
        //     },
        //     filename: function (reqx, file, cb) {
        //         const extension = file.originalname?.match(/\.[0-9a-z]+$/gi)?.[0]?.toLocaleLowerCase() ?? ""
        //         if(!format.includes(extension)) {
        //             throw 
        //         }
        //         cb(null, nanoid() + extension)
        //     }
        // })

        // const upload = multer({ storage: storage })

        // const uploadPromise = deferred()
        // upload.single('file')(req, res, uploadPromise.defer())
        // await uploadPromise
        // console.log(req.body.id)
        // res.json(req.file)
    })

    app.use((err, req, res, next) => {
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        })
    })
}
