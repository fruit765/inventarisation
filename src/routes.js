module.exports = function (app) {
    app.post("/api/login", validLogin, (req, res, next) => {
        req.session.regenerate(() => { })
        next()
    }, passport.authenticate('local'), function (req, res, next) {
        res.json(jsonResPattern("OK"))
    })
}