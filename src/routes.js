module.exports = function (app) {
    app.post("/api/login", validLogin, (req, res, next) => {
        req.session.regenerate(() => { })
        next()
    })
}