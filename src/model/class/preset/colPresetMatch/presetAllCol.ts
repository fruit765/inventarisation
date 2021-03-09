import _ from "lodash"
import PresetOneCol from "./presetOneCol"

export default class PresetAllCol {
    private oldData: any
    private newData: any
    private preset: any
    private column: any
    private columnKeys: string[]
    private logic: string
    private eval: string
    private columnClasses: any

    constructor(preset: any) {

        this.oldData = {}
        this.newData = {}
        this.preset = _.isEmpty(preset) ? { column: {}, logic: "false" } : preset
        this.column = this.preset.column
        this.columnKeys = _.keys(this.column)
        this.logic = this.preset.logic ?? this.columnKeys.join(" && ")
        this.eval = ""
        this.columnClasses = {}
        for (let key in this.column) {
            this.columnClasses[key] = new PresetOneCol(this.column[key])
        }

        this.logicToEval()
    }


    /** Преобразует logic в logicEval строку которая при запуске через eval() возвращает
     * результат сравнения*/
    private logicToEval() {
        this.eval = this.logic
        for (let key of this.columnKeys) {
            this.eval = this.eval.replace(
                new RegExp("(?<!\\w)" + key + "(?!\\w)", "gi"),
                `(await this.columnClasses.${key}.match([this.newData.${key}, this.oldData.${key}]))`
            )
        }

        this.eval = `(async () => ${this.eval})()`
    }

    /**Проверяет значение на соответствие пресету
     * Первое значение в массиве относится к новым данным Второе к старым*/
    async match(data: any[]) {
        this.newData = data[0] ?? {}
        this.oldData = data[1] ?? {}
        const res = Boolean(await eval(this.eval))
        return res
    }
}