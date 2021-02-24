"use strict"

const { set } = require("lodash")
const _ = require("lodash")

class propContainer {
    constructor(prop) {
        this.prop = prop
    }

    addViewProp(propSchema) {

    }

    addViewSingle(superKey, keyArray) {
        new Proxy({}, {
            get(target, prop, receiver) {
                const eventIncludes = Object.keys(this.prop.event).includes(prop)
                const historyIncludes = Object.keys(this.prop.history).includes(prop)
                const presetIncludes = Object.keys(this.prop.preset).includes(prop)
                const otherIncludes = Object.keys(this.prop.other).includes(prop)
                let isPropConflict = false
                if(eventIncludes + historyIncludes + presetIncludes + otherIncludes > 1) {
                    isPropConflict = true
                }
                
                if (eventIncludes) {
                    return Reflect.get(this.prop.event, prop, receiver)
                } else if (historyIncludes) {
                    return Reflect.get(this.prop.history, prop, receiver)
                } else if (presetIncludes) {
                    return Reflect.get(this.prop.preset, prop, receiver)
                } else if (otherIncludes) {
                    return Reflect.get(this.prop.other, prop, receiver)
                }
            },
            set(target, prop, val, receiver) {
                return Reflect.set(a, prop, val, receiver)
            },
            ownKeys() {
                return ["a"]
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true
                }
            }
        })
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