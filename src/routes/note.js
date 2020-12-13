import express from 'express'
import middlewares from '../middlewares'
import schemes from '../schemes'
import models from '../models'

const router = express.Router()

/**
 * @api {post} /note Создание заметки
 *
 * @apiVersion 0.0.1
 * @apiName note_create
 * @apiGroup Note
 *
 * @apiParam (Body params) {String{..1000}} title Название заметки
 *
 * @apiErrorExample {json} Unauthorized:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Unauthorized"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "id": 1,
 *        "userId": 1,
 *        "title": "user 1 note 1",
 *        "createdAt": "2020-12-12T17:31:43.000Z",
 *        "updatedAt": "2020-12-12T17:31:43.000Z"
 *    }
 */
router.post('/', middlewares.auth, middlewares.validate(schemes.note.create), async (req, res, next) => {
  try {
    const { title } = req.body

    const note = await req.models.note.create({ title })

    res.json(note)
  } catch (err) {
    next(err)
  }
})

/**
 * @api {patch} /note/:id Редактирование заметки
 *
 * @apiVersion 0.0.1
 * @apiName note_update
 * @apiGroup Note
 *
 * @apiParam (Params) {Number} :id Id заметки
 * @apiParam (Body params) {String{..1000}} title Название заметки
 *
 * @apiErrorExample {json} Bad Request:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Note not found"
 *    }
 *
 * @apiErrorExample {json} Unauthorized:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Unauthorized"
 *    }
 *
 * @apiErrorExample {json} Forbidden:
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "Forbidden"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "id": 1,
 *        "userId": 1,
 *        "title": "user 1 note 1 (updated)",
 *        "createdAt": "2020-12-12T17:31:43.000Z",
 *        "updatedAt": "2020-12-12T17:31:43.000Z"
 *    }
 */
router.patch('/:id', middlewares.auth, middlewares.validate(schemes.note.update), async (req, res, next) => {
  try {
    const { id } = req.params
    const { title } = req.body

    const note = await req.models.note.update({ id, title })

    res.json(note)
  } catch (err) {
    next(err)
  }
})

/**
 * @api {patch} /note/:id Удаление заметки
 *
 * @apiVersion 0.0.1
 * @apiName note_delete
 * @apiGroup Note
 *
 * @apiParam (Params) {Number} :id Id заметки
 *
 * @apiErrorExample {json} Bad Request:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Note not found"
 *    }
 *
 * @apiErrorExample {json} Unauthorized:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Unauthorized"
 *    }
 *
 * @apiErrorExample {json} Forbidden:
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "Forbidden"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 */
router.delete('/:id', middlewares.auth, middlewares.validate(schemes.note.delete), async (req, res, next) => {
  try {
    const { id } = req.params

    await req.models.note.delete({ id })

    res.status(200).end()
  } catch (err) {
    next(err)
  }
})

/**
 * @api {get} /note Получение списка заметок
 *
 * @apiVersion 0.0.1
 * @apiName note_get_page
 * @apiGroup Note
 *
 * @apiParam (Query params) {Number{0-100}} [pageSize=100] Максимальное количество заметок на 1 странице
 * @apiParam (Query params) {Number{1..}} [pageNumber=1] Максимальное количество заметок на 1 странице
 *
 * @apiErrorExample {json} Unauthorized:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Unauthorized"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "totalCount": 1,
 *      "pageSize": 100,
 *      "pageNumber": 1,
 *      "data": [
 *         {
 *           "id": 1,
 *           "userId": 1,
 *           "title": "user 1 note 1",
 *           "createdAt": "2020-12-12T16:04:33.000Z",
 *           "updatedAt": "2020-12-12T17:40:47.000Z"
 *         }
 *      ]
 *    }
 */
router.get('/', middlewares.auth, middlewares.validate(schemes.note.getPage), async (req, res, next) => {
  try {
    const { pageSize, pageNumber } = req.query

    const notesPage = await req.models.note.getPage({ pageSize, pageNumber })

    res.json(notesPage)
  } catch (err) {
    next(err)
  }
})

/**
 * @api {post} /note/:id/createLink Создание ссылки общего доступа
 *
 * @apiVersion 0.0.1
 * @apiName note_create_shared_link
 * @apiGroup Note
 *
 * @apiParam (Params) {Number} :id Id заметки
 *
 * @apiErrorExample {json} Bad Request:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Note not found"
 *    }
 *
 * @apiErrorExample {json} Unauthorized:
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Unauthorized"
 *    }
 *
 * @apiErrorExample {json} Forbidden:
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "Forbidden"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "link": "e6a16a96-ee72-4ea7-b384-361265e796a9"
 *    }
 */
router.post(
  '/:id/createLink',
  middlewares.auth,
  middlewares.validate(schemes.note.createLink),
  async (req, res, next) => {
    try {
      const { id } = req.params
      const link = await req.models.note.createLink({ id })

      res.json({ link })
    } catch (err) {
      next(err)
    }
  },
)

/**
 * @api {post} /note/shares/:link Получение заметки по ссылке общего доступа
 *
 * @apiVersion 0.0.1
 * @apiName note_get_by_link
 * @apiGroup Note
 *
 * @apiParam (Params) {String} :link Ссылка общего доступа
 *
 * @apiErrorExample {json} Bad Request:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Note not found"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "title": "user 1 note 1"
 *    }
 */
router.get('/shares/:link', middlewares.validate(schemes.note.getByLink), async (req, res, next) => {
  try {
    const { link } = req.params

    const note = await models.Note.getByLink({ link })

    res.json(note)
  } catch (err) {
    next(err)
  }
})

export default router
