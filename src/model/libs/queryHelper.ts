import Brand from "../orm/brand"
import Device from "../orm/device"
import knex from "../orm/knexConf"
import Post from "../orm/post"
import _ from "lodash"
import Employer from "../orm/employer"
import Dep_loc from "../orm/dep_loc"
import Post_dep_loc from "../orm/post_dep_loc"
import Department from "../orm/department"

/**Получаем класс таблицы по ее названию */
function getTabClassByName(name:string) {
    const nameClass: any = {
        "device": Device,
        "brand": Brand,
        "employer": Employer,
        "post": Post,
        "dep_loc": Dep_loc,
        "post_dep_loc": Post_dep_loc,
        "department": Department
    }
    return nameClass[name.toLowerCase()]
}

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
async function sqlsToValues(sql: string[] | string): Promise<Array<any>> {
    if (typeof sql === "string") {
        sql = [sql]
    }
    const value = []
    for (let key in sql) {
        value[Number(key)] = await selectSqlStrToValue(sql[key])
    }
    return value
}

/**Проверяет есть ли колонка в таблице также возвращает false если нет самой таблицы*/
async function hasCol(tableName: string, colName: string) {
    return knex.schema.hasColumn(tableName, colName).catch(err => {
        if (err.errno === 1146) {
            return false
        } else {
            return Promise.reject(err)
        }
    })
}

export { hasCol, sqlsToValues, getTabClassByName }