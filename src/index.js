import app from './app'
import config from './config'

app.listen(config.listenPort, () => {
  // eslint-disable-next-line
  console.log(`Server listening on port: ${config.listenPort}`)
})

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line
  console.error(err)
})

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line
  console.error(err)
})
