const jwt = require("jsonwebtoken");
const config = require("../config");

const generateAccessToken = (user) => {
  return jwt.sign(user, config.secrets.accessToken, { expiresIn: "1m" });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, config.secrets.refreshToken, { expiresIn: "7d" });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
