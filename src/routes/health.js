import express from 'express'

const router = express.Router()

/**
 * @api {get} / Проверка работоспособности сервера
 *
 * @apiVersion 0.0.1
 * @apiName health_check
 * @apiGroup Health
 *
 * @apiSuccessExample SUCCESS:
 *   HTTP/1.1 200 OK
 */
router.get('/', async (req, res, next) => {
  try {
    res.status(200).end()
  } catch (err) {
    next(err)
  }
})

export default router
