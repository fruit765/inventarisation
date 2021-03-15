import _ from "lodash"

type initAttr = { init?: Promise<void> } | undefined

async function startInit(initAttr: initAttr, fn: () => void | Promise<void>) {
    if (initAttr?.init) {
        return initAttr?.init
    } else {
        initAttr = {}
        return initAttr.init = (async () => await fn())()
    }
}

export { startInit, initAttr }