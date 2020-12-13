import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import knex from '../utils/knex'
import ClientError from '../utils/ClientError'
import config from '../config'
import redis from '../utils/redis'

const { jwtSecret, saltRounds, accessTokenExpiresIn, refreshTokenExpiresIn } = config.user

export default class User {
  constructor({ userId, accessToken, refreshToken }) {
    this.userId = userId
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  static findOne(where) {
    return knex('user').select().where(where).first()
  }

  static async signup({ username, password, name, secondName }) {
    if (await this.findOne({ username })) {
      throw new ClientError('Username already in use', 400)
    }

    const passwordHash = await bcrypt.hash(password, saltRounds)

    await knex('user').insert({ username, passwordHash, name, secondName })
  }

  static async signin({ username, password }) {
    const user = await this.findOne({ username })

    if (!user) {
      throw new ClientError('Username or password is wrong', 401)
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordCorrect) {
      throw new ClientError('Username or password is wrong', 401)
    }

    const accessToken = jwt.sign({ userId: user.id, random: Math.random() }, jwtSecret, {
      expiresIn: accessTokenExpiresIn,
    })
    const refreshToken = jwt.sign({ userId: user.id, random: Math.random() }, jwtSecret, {
      expiresIn: refreshTokenExpiresIn,
    })

    await redis
      .multi()
      .set(`user_${user.id}_access_${accessToken}`, refreshToken, 'PX', accessTokenExpiresIn)
      .set(`user_${user.id}_refresh_${refreshToken}`, accessToken, 'PX', refreshTokenExpiresIn)
      .exec()

    return { accessToken, refreshToken }
  }

  static async refresh({ refreshToken }) {
    try {
      const decoded = jwt.verify(refreshToken, config.user.jwtSecret)
      const accessToken = await redis.get(`user_${decoded.userId}_refresh_${refreshToken}`)

      if (!accessToken) {
        throw new ClientError('Unauthorized', 401)
      }

      const newAccessToken = jwt.sign({ userId: decoded.userId, random: Math.random() }, jwtSecret, {
        expiresIn: accessTokenExpiresIn,
      })
      const newRefreshToken = jwt.sign({ userId: decoded.userId, random: Math.random() }, jwtSecret, {
        expiresIn: refreshTokenExpiresIn,
      })

      await redis
        .multi()
        .del(`user_${decoded.userId}_access_${accessToken}`)
        .del(`user_${decoded.userId}_refresh_${refreshToken}`)
        .set(`user_${decoded.userId}_access_${newAccessToken}`, newRefreshToken, 'PX', accessTokenExpiresIn)
        .set(`user_${decoded.userId}_refresh_${newRefreshToken}`, newAccessToken, 'PX', refreshTokenExpiresIn)
        .exec()

      return { newAccessToken, newRefreshToken }
    } catch (err) {
      throw new ClientError('Unauthorized', 401)
    }
  }

  async signout({ fromAllDevices }) {
    if (fromAllDevices) {
      const keys = await redis.keys(`user_${this.userId}*`)

      return redis.del(...keys)
    }
    return redis
      .multi()
      .del(`user_${this.userId}_access_${this.accessToken}`, `user_${this.userId}_refresh_${this.refreshToken}`)
      .del(`user_${this.userId}_refresh_${this.refreshToken}`, `user_${this.userId}_access_${this.accessToken}`)
      .exec()
  }
}
