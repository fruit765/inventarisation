import _ from "lodash"

/**Возвращает объект без пустых значений*/
function delUndefined(x: any) {
    return _.omitBy(x, _.isUndefined)
}

/**Возвращает объект без пустых значений*/
function delUndefinedDeep(x: any) {
    const y = delUndefined(x)
    for (let key in y) {
        if (_.isObject(y[key])) {
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

/**{"a":2,"b":3, "1":5} => {2: true, 3: true, 5:true}*/
function uniqObjToBoolObj(obj: { [key: string]: number }): { [key: number]: boolean } {
    const boolObj: any = {}
    for (let key in obj) {
        if (obj[key]) {
            boolObj[obj[key]] = true
        }
    }
    return boolObj
}

/**Применяет JSON.stringify ко всем вложенным объектам*/
function stringifySubJSON(data: any) {
    const fillteredData: any = {}
    for (let key in data) {
        if (_.isObject(data[key])) {
            fillteredData[key] = JSON.stringify(data[key])
        } else {
            fillteredData[key] = data[key]
        }
    }
    return fillteredData
}

function mapArrayOrObject(object: Record<any, any>, fn: (value: any, key: string) => any, condition : (result?: any) => boolean = () => true) {
    if (!_.isObject(object)) {
        return object
    }
    const result = new (<any>object).__proto__.constructor()
    for (let key in object) {
        const resultFn = fn((<any>object)[key], key)
        if (condition(resultFn)) {
            result[key] = resultFn
        }
    }
    return result
}

export { delUndefined, stringifySubJSON, delUndefinedDeep, uniqObjToBoolObj, mapArrayOrObject }