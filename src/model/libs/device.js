const {attemptP} = require("Fluture")
const Device = require("../orm/device")

function getDeviceAll() {
    attemptP(Device.query().select())
}