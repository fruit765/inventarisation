// import Brand from "../orm/brand"
// import Device from "../orm/device"

import knex from "../orm/knexConf"
import _ from "lodash"

// /**Получаем класс таблицы по ее названию */
// export function getTabClassByName(name:string) {
//     const nameClass: any = {
//         "device": Device,
//         "brand": Brand
//     }
//     return nameClass[name.toLowerCase()]
// }

/**Возвращает массив значений из первого столбца из запроса */
async function selectSqlStrToValue(sqlString: any) {
    const query = sqlString.split(";")[0].trim().match(/^select.*$/)?.[0]
    if (query) {
        const dbRes = await knexQuery(query)
        const firstKey = Object.keys(dbRes[0])[0]
        const resArray = _.map(dbRes, firstKey)
        return resArray
    } else {
        return []
    }
}

/**Делает запрос в базу данных*/
async function knexQuery(query: string) {
    return knex.raw(query).then(x => x[0])
}


/**Переводит массив sql селект запросов в массив значений*/
export async function sqlsToValues(sql: string[] | string): Promise<Array<any>> {
    if (typeof sql === "string") {
        sql = [sql]
    }
    const value = []
    for (let key in sql) {
        value[Number(key)] = await selectSqlStrToValue(sql[key])
    }
    return value
}