import jwt from 'jsonwebtoken'
import ClientError from '../utils/ClientError'
import config from '../config'
import redis from '../utils/redis'
import models from '../models'

// eslint-disable-next-line
export default async (req, res, next) => {
  try {
    const { accessToken } = req.cookies

    if (!accessToken) {
      return next(new ClientError('Unauthorized', 401))
    }

    const decoded = jwt.verify(accessToken, config.user.jwtSecret)
    const refreshToken = await redis.get(`user_${decoded.userId}_access_${accessToken}`)

    if (!refreshToken) {
      return next(new ClientError('Unauthorized', 401))
    }

    // Inject models to req
    req.models = {
      ...(req.models || {}),
      user: new models.User({ userId: decoded.userId, accessToken, refreshToken }),
      note: new models.Note({ userId: decoded.userId }),
    }

    next()
  } catch (err) {
    next(new ClientError('Unauthorized', 401))
  }
}
