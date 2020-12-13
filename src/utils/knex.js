import knex from 'knex'
import config from '../config'

export default knex({
  client: 'mysql',
  connection: config.db,
  pool: { min: 0, max: 10 },
})
