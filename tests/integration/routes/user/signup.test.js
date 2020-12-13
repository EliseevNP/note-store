import supertest from 'supertest'
import app from '../../../../src/app'
import setupDatabaseScheme from '../../../../sql/setup-database-scheme'
import knex from '../../../../src/utils/knex'
import fixtures from '../../../fixtures'

const USER = fixtures.users[0]

describe('user signup', () => {
  const request = supertest(app)

  beforeEach(async () => {
    await setupDatabaseScheme()
  })

  it('should create user', async () => {
    const response = await request.post('/user/signup').send(USER)

    const user = await knex('user').select().first()

    expect(response.status).toBe(200)
    expect(user).toMatchObject({
      username: USER.username,
      name: USER.name,
      secondName: USER.secondName,
    })
  })
})
