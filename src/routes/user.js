import express from 'express'
import middlewares from '../middlewares'
import schemes from '../schemes'
import models from '../models'
import config from '../config'
import ClientError from '../utils/ClientError'

const { accessTokenExpiresIn, refreshTokenExpiresIn } = config.user

const router = express.Router()

/**
 * @api {post} /user/signup Регистрация пользователя
 *
 * @apiVersion 0.0.1
 * @apiName user_signup
 * @apiGroup User
 *
 * @apiParam (Body params) {String{..100}} username Имя пользователя
 * @apiParam (Body params) {String{..100}} password Пароль
 * @apiParam (Body params) {String{..100}} [name] Имя
 * @apiParam (Body params) {String{..100}} [secondName] Фамилия
 *
 * @apiErrorExample {json} Bad Request:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Username already in use"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 */
router.post('/signup', middlewares.validate(schemes.user.signup), async (req, res, next) => {
  try {
    const { username, password, name, secondName } = req.body

    await models.User.signup({ username, password, name, secondName })

    res.status(200).end()
  } catch (err) {
    next(err)
  }
})

/**
 * @api {post} /user/signin Аутентификация пользователя
 *
 * @apiDescription Сервер сохраняет accessToken и refreshToken в cookies
 *
 * @apiVersion 0.0.1
 * @apiName user_sign
 * @apiGroup User
 *
 * @apiParam (Body params) {String{..100}} username Имя пользователя
 * @apiParam (Body params) {String{..100}} password Пароль
 *
 * @apiErrorExample {json} Unauthorized:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Username or password is wrong"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 */
router.post('/signin', middlewares.validate(schemes.user.signin), async (req, res, next) => {
  try {
    const { username, password } = req.body

    const { accessToken, refreshToken } = await models.User.signin({ username, password })

    res.cookie('accessToken', accessToken, { maxAge: accessTokenExpiresIn })
    res.cookie('refreshToken', refreshToken, { maxAge: refreshTokenExpiresIn, path: '/user/refresh' })
    res.status(200).end()
  } catch (err) {
    next(err)
  }
})

/**
 * @api {post} /user/refresh Обновление токенов
 *
 * @apiDescription Обновление accessToken'а и refreshToken'а, сохраненных в cookies после аутентификации пользователя
 *
 * @apiVersion 0.0.1
 * @apiName user_refresh
 * @apiGroup User
 *
 * @apiErrorExample {json} Unauthorized:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Unauthorized"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 */
// eslint-disable-next-line
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      return next(new ClientError('Unauthorized', 401))
    }

    const { newAccessToken, newRefreshToken } = await models.User.refresh({ refreshToken })

    res.cookie('accessToken', newAccessToken, { maxAge: accessTokenExpiresIn })
    res.cookie('refreshToken', newRefreshToken, { maxAge: refreshTokenExpiresIn, path: '/user/refresh' })
    res.status(200).end()
  } catch (err) {
    next(err)
  }
})

/**
 * @api {post} /user/signout Выход из учетной записи
 *
 * @apiVersion 0.0.1
 * @apiName user_signout
 * @apiGroup User
 *
 * @apiParam (Body params) {Boolean} [fromAllDevices=false] Если true, будет осуществлен выход из всех сессий пользователя
 *
 * @apiErrorExample {json} Unauthorized:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Unauthorized"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 */
router.post('/signout', middlewares.auth, middlewares.validate(schemes.user.signout), async (req, res, next) => {
  try {
    const { fromAllDevices } = req.body

    await req.models.user.signout({ fromAllDevices })

    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(200).end()
  } catch (err) {
    next(err)
  }
})

export default router
