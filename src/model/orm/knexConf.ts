import Knex from "knex"
import { db as dbConfig } from "../../../serverConfig"

const knex = Knex(dbConfig)

export default knex
