const { verifyAccessToken } = require("../utils/tokenUtils");

const validateAccessToken = (req, res, next) => {
  const accessToken = req.cookies.authorization;

  if (!accessToken) {
    return res.status(401).json({ message: "Access token not found" });
  }

  try {
    verifyAccessToken(accessToken);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Malformed JWT", refresh: "http://localhost:3000/auth/refresh" });
  }
};

module.exports = validateAccessToken;
