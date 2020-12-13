import supertest from 'supertest'
import cookie from 'cookie'
import app from '../../../../src/app'
import setupDatabaseScheme from '../../../../sql/setup-database-scheme'
import fixtures from '../../../fixtures'
import redis from '../../../../src/utils/redis'
import config from '../../../../src/config'
import knex from '../../../../src/utils/knex'

const USER = fixtures.users[0]

describe('user signin', () => {
  const request = supertest(app)

  beforeEach(async () => {
    await setupDatabaseScheme()
    await redis.flushall()
    await request.post('/user/signup').send(USER)
  })

  it("shouldn't authorize user (because username is wrong)", async () => {
    const signinResponse = await request.post('/user/signin').send({
      username: 'wrong username',
      password: USER.password,
    })

    expect(signinResponse.status).toBe(401)
    expect(signinResponse.body).toMatchObject({
      message: 'Username or password is wrong',
    })
  })

  it("shouldn't authorize user (because password is wrong)", async () => {
    const signinResponse = await request.post('/user/signin').send({
      username: USER.username,
      password: 'wrong password',
    })

    expect(signinResponse.status).toBe(401)
    expect(signinResponse.body).toMatchObject({
      message: 'Username or password is wrong',
    })
  })

  it('should authorize user', async () => {
    const signinResponse = await request.post('/user/signin').send({
      username: USER.username,
      password: USER.password,
    })
    expect(signinResponse.status).toBe(200)

    const cookies = signinResponse.headers['set-cookie'].map((cookieItem) => cookie.parse(cookieItem))
    expect(cookies.length).toBe(2)

    const [accessTokenCookie, refreshTokenCookie] = cookies
    const user = await knex('user').select().first()
    const accessToken = await redis.get(`user_${user.id}_refresh_${refreshTokenCookie.refreshToken}`)
    const refreshToken = await redis.get(`user_${user.id}_access_${accessTokenCookie.accessToken}`)

    expect(accessTokenCookie).toMatchObject({
      accessToken,
      Path: '/',
      'Max-Age': (config.user.accessTokenExpiresIn / 1000).toString(),
    })
    expect(refreshTokenCookie).toMatchObject({
      refreshToken,
      Path: '/user/refresh',
      'Max-Age': (config.user.refreshTokenExpiresIn / 1000).toString(),
    })
  })
})
