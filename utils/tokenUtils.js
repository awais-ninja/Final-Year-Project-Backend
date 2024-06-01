const jwt = require("jsonwebtoken");
const config = require("../config");

const generateAccessToken = (user, expires = config.secrets.accessTokenExpires) => {
  return jwt.sign(user, config.secrets.accessToken, { expiresIn: expires });
};

const generateRefreshToken = (user, expires = config.secrets.refreshTokenExpires) => {
  return jwt.sign(user, config.secrets.refreshToken, { expiresIn: expires });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.secrets.accessToken);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.secrets.refreshToken);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
