import { Model } from "objection"
import knex from "./knexConf"

Model.knex(knex)

export default class SuperModel extends Model {

}