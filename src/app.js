import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import routes from './routes'
import middlewares from './middlewares'

const app = express()

app.use(cookieParser())
app.use(bodyParser.json({ limit: '10mb' }))
app.use(routes)
app.use(middlewares.errorHandler)

export default app
