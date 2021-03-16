# Дополнительные поля (additional)
Пресет для генерации индивидуальных полей. 
## Формат
```
{
    "stdModule": [ /**модуль для расширения пресетов. За парсинг отвечает одноименный класс*/
        sql: ["select id from device where id= ${table_id}"] /**массив строк или строка*/
        value: [1,"${table_id}"] /**массив или значение можно использовать шаблоны*/
        name: { /**блок имени*/
            "value": "test ${table}"
            "sql": "select id from device where id= ${table_id}"
        }
    ]
}
```
