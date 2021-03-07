import _ from "lodash"

/**Возвращает объект без пустых значений*/
function delUndefined(x: any) {
    return _.omitBy(x, _.isUndefined)
}

export { delUndefined }