"use strict"

const _ = require("lodash")

class propContainer {
    constructor(prop) {
        this.prop = prop
    }

    addViewProp(propSchema) {

    }

    addViewSingle(superKey, keyArray) {
        if (typeof keyArray === "string") {
            keyArray = [keyArray]
        } else if (!_.isArray(keyArray) || !this.prop[superKey]) {
            return this
        }

        if (keyArray.includes("*")) {
            keyArray = Object.keys(this.prop[superKey])
        } else {
            keyArray = _.intersection(Object.keys(this.prop[superKey]), keyArray)
        }
        

    }

    get() {

    }

    reset() {

    }

    clear() {

    }
}