type initAttr = { init?: Promise<void> }

async function startInit(initAttr: initAttr, fn: () => void | Promise<void>) {
    if (initAttr?.init) {
        return initAttr?.init
    } else {
        return initAttr.init = Promise.resolve(fn())
    }
}

export { startInit, initAttr }