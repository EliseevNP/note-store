import express from 'express'
import health from './health'
import note from './note'
import user from './user'

const router = express.Router()

router.use(`/`, health)
router.use(`/user`, user)
router.use(`/note`, note)

export default router
