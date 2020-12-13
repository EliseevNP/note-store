import fs from 'fs'
import knex from '../src/utils/knex'

const sql = fs.readFileSync('./sql/scheme.sql')

export default () => knex.raw(sql.toString())
