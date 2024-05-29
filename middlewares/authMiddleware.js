const jwt = require("jsonwebtoken");
const config = require("../config");

const validateToken = (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "Refresh token not found" });

  jwt.verify(token, config.secrets.accessToken, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

module.exports = validateToken;
