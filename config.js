module.exports = {
  port: 8080,
  psql: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  redis: {
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
  },
  secrets: {
    session: process.env.SESSION_SECRET,
    refreshToken: process.env.REFRESH_TOKEN_SECRET,
    accessToken: process.env.ACCESS_TOKEN_SECRET,
  },
};
