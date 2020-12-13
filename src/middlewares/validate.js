import expect from 'expect-schema'
import ClientError from '../utils/ClientError'

// eslint-disable-next-line
export default (schema) => async (req, res, next) => {
  try {
    if (schema.params) {
      expect(req.params, schema.params)
    }

    if (schema.query) {
      expect(req.query, schema.query)
    }

    if (schema.body) {
      expect(req.body, schema.body)
    }
  } catch (err) {
    return next(new ClientError(err.message, 400))
  }

  next()
}
