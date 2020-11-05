module.exports = function (app) {
    app.get("/getBrand", (req, res, next) => {
        req.session.regenerate(() => { })
        next()
    })
}