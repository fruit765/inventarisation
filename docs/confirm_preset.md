# Пресет подтверждений

## Формат

`
{
    "confirms": [ // блоки подтверждений
        {
            "sql": "select id from resp where stockResp is not null",
            "group": {
                "value": "dsdsd"
            },
            "type": "simple"
        },
        {
            "sql": [
                "select user_id from device where id = ${table_id}"
            ],
            "type": "act"
        },
        {
            "value": [
                "${actor_id}"
            ],
            "type": "act"
        }
    ],
    "veto": [ //блок вето
        {
            "sql": [
                "select id from status where status = 'stock'"
            ],
            "logic": "sql0"
        }
    ],
    "personal": [ //блок указывающий для кого задача является персональной
        0,
        1
    ]
}
`
## Блок подтверждений
Находятся в массиве, между элементами связь И. Чтоб событие считалось подтвержденным каждый элемент должен быть подтвержден.
Связь внутри блоков между значениями ИЛИ.
Отклонение любого блока отклонит сразу событие
`
{
            "sql": [ //блок sql значений
                "select id from resp where stockResp is not null,
                "select id from user where id = "${table_id}""
            ],
            "value": [1,2,"${table}"], //блок значений
            "group": { //блок группы
                "value": "dsdsd"
            },
            "type": "simple", //тип подтверждения
            "type_desc": { //блок типа подтверждения
            }
}
`

### Блок sql
Содержит массив строк с select sql запросами. Возможно использование шаблонов в запросах. Запросы будут преобразованны в
значения. Так же возможно использование единственной строки
`
"sql": [ //блок sql значений
"select id from resp where stockResp is not null,
"select id from user where id = "${table_id}""
] 
`

