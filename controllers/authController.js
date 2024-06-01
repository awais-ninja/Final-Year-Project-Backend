const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByUsername, findUserByEmail } = require("../queries/users");
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require("../utils/tokenUtils");
const { client, getAsync, setAsync } = require("../utils/redis");
const config = require("../config");

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: "Username, email and password are required" });

  const existingUsername = await findUserByUsername(username);
  const existingEmail = await findUserByEmail(email);

  if (existingUsername) return res.status(400).json({ message: "Username already exists" });
  if (existingEmail) return res.status(400).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser(username, email, hashedPassword);

  res.status(201).json({ message: "User registered successfully", user: { id: user.id, username: user.username, email: user.email } });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
  const user = await findUserByUsername(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken({ userId: user.id, isAdmin: user.is_admin });
  const refreshToken = generateRefreshToken({ userId: user.id, isAdmin: user.is_admin });

  await client.set(`session-${user.id}`, refreshToken);

  delete user.password;
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  user.refreshTokenExpires = Date.now() + config.secrets.refreshTokenExpires * 1000;
  user.accessTokenExpires = Date.now() + config.secrets.accessTokenExpires * 1000;
  console.log(new Date(user.refreshTokenExpires), new Date(user.accessTokenExpires));
  return res.json({ user });
};

const refresh = async (req, res) => {
  console.log(req.cookies);
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Refresh token not found" });

  try {
    const payload = verifyRefreshToken(token);
    const storedToken = await client.get(`session-${payload.userId}`);

    if (storedToken !== token) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({ userId: payload.userId, isAdmin: payload.isAdmin });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, isAdmin: payload.isAdmin });

    await client.set(`session-${payload.userId}`, newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpires: Date.now() + config.secrets.accessTokenExpires * 1000,
      refreshTokenExpires: Date.now() + config.secrets.refreshTokenExpires * 1000,
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = {
  register,
  login,
  refresh,
};
