import _ from "lodash"

/**Возвращает объект без пустых значений*/
function delUndefined(x: any) {
    return _.omitBy(x, _.isUndefined)
}

/**Возвращает объект без пустых значений*/
function delUndefinedDeep(x: any) {
    const y = delUndefined(x)
    for (let key in y) {
        if (typeof y[key] === "object") {
            const z = delUndefinedDeep(y[key])
            if (!_.isEmpty(z)) {
                y[key] = z
            } else {
                delete y[key]
            }
        }
    }
    return y
}

/**Применяет JSON.stringify ко всем вложенным объектам*/
function stringifySubJSON(data: any) {
    const fillteredData: any = {}
    for (let key in data) {
        if (typeof data[key] === "object") {
            fillteredData[key] = JSON.stringify(data[key])
        } else {
            fillteredData[key] = data[key]
        }
    }
    return fillteredData
}

export { delUndefined, stringifySubJSON, delUndefinedDeep }