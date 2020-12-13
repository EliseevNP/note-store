import supertest from 'supertest'
import cookie from 'cookie'
import app from '../../../../src/app'
import setupDatabaseScheme from '../../../../sql/setup-database-scheme'
import fixtures from '../../../fixtures'
import redis from '../../../../src/utils/redis'
import config from '../../../../src/config'
import knex from '../../../../src/utils/knex'

const USER = fixtures.users[0]

describe('user signout', () => {
  const agent = supertest.agent(app.listen(config.listenPort))

  beforeEach(async () => {
    await setupDatabaseScheme()
    await redis.flushall()
    await agent.post('/user/signup').send(USER)
  })

  it('should remove user session', async () => {
    // setup 3 user sessions
    // session 1
    const signinResponse1 = await agent.post('/user/signin').send({
      username: USER.username,
      password: USER.password,
    })
    // session 2
    const signinResponse2 = await agent.post('/user/signin').send({
      username: USER.username,
      password: USER.password,
    })
    // session 3
    const signinResponse3 = await agent.post('/user/signin').send({
      username: USER.username,
      password: USER.password,
    })

    expect(signinResponse1.status).toBe(200)
    expect(signinResponse2.status).toBe(200)
    expect(signinResponse3.status).toBe(200)

    // now redis should contain 3 accessToken's and 3 refreshToken's (for each session)
    const user = await knex('user').select().first()
    let redisAccessTokensKeys = await redis.keys(`user_${user.id}_access*`)
    let redisRefreshTokensKeys = await redis.keys(`user_${user.id}_refresh*`)

    expect(redisAccessTokensKeys.length).toBe(3)
    expect(redisRefreshTokensKeys.length).toBe(3)

    // signout from current session (from session 3)
    const signoutResponse1 = await agent.post('/user/signout')
    expect(signoutResponse1.status).toBe(200)

    const cookies = signoutResponse1.headers['set-cookie'].map((cookieItem) => cookie.parse(cookieItem))
    expect(cookies.length).toBe(2)

    const [accessTokenCookie, refreshTokenCookie] = cookies
    expect(accessTokenCookie).toMatchObject({
      accessToken: '',
      Path: '/',
      Expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
    })
    expect(refreshTokenCookie).toMatchObject({
      refreshToken: '',
      Path: '/',
      Expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
    })

    // now redis should contain 2 accessToken's and 2 refreshToken's (for sessions 1 and 2)
    redisAccessTokensKeys = await redis.keys(`user_${user.id}_access*`)
    redisRefreshTokensKeys = await redis.keys(`user_${user.id}_refresh*`)

    expect(redisAccessTokensKeys.length).toBe(2)
    expect(redisRefreshTokensKeys.length).toBe(2)

    // signin again to check signout from all sessions
    // session 4
    const signinResponse4 = await agent.post('/user/signin').send({
      username: USER.username,
      password: USER.password,
    })
    expect(signinResponse4.status).toBe(200)

    // signout from all sessions
    const signoutResponse2 = await agent.post('/user/signout').send({ fromAllDevices: true })
    expect(signoutResponse2.status).toBe(200)

    // now redis shouldn't contain any tokens
    redisAccessTokensKeys = await redis.keys(`user_${user.id}_access*`)
    redisRefreshTokensKeys = await redis.keys(`user_${user.id}_refresh*`)

    expect(redisAccessTokensKeys.length).toBe(0)
    expect(redisRefreshTokensKeys.length).toBe(0)
  })
})
