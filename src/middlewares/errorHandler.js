import ClientError from '../utils/ClientError'

// eslint-disable-next-line
export default (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  if (err instanceof ClientError) {
    const { status, message } = err

    return res.status(status).json({ message })
  }

  // eslint-disable-next-line
  console.error(err);

  res.status(500).json({ message: 'Internal Server Error' })
}
