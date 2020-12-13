import ms from 'ms'
import dotenv from 'dotenv'
import path from 'path'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.testing.env') })
}

const validateTokenExpiresIn = (type, expiresIn) => {
  const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    expiresIn,
  )

  if (!match) {
    // eslint-disable-next-line
    console.error(`Unsoported ${type} expiresIn format`)
    process.exit(1)
  }
}

if (process.env.ACCESS_TOKEN_EXPIRES_IN) {
  validateTokenExpiresIn('ACCESS_TOKEN', process.env.ACCESS_TOKEN_EXPIRES_IN)
}

if (process.env.REFRESH_TOKEN_EXPIRES_IN) {
  validateTokenExpiresIn('REFRESH_TOKEN', process.env.REFRESH_TOKEN_EXPIRES_IN)
}

export default {
  listenPort: process.env.APP_PORT || 3000,
  db: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || '3306',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root_password',
    database: process.env.MYSQL_DATABASE || 'notes',
    multipleStatements: true,
  },
  user: {
    saltRounds: +process.env.SALT_ROUNDS || 10,
    jwtSecret: process.env.JWT_SECRET || 'jwt_secret',
    // supported formats of expiresIn values: https://github.com/vercel/ms
    accessTokenExpiresIn: ms(process.env.ACCESS_TOKEN_EXPIRES_IN || '1h'),
    refreshTokenExpiresIn: ms(process.env.REFRESH_TOKEN_EXPIRES_IN || '1d'),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
}
