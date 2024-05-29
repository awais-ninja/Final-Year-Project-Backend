const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByUsername } = require("../queries/users");
const { generateAccessToken, generateRefreshToken } = require("../utils/tokenUtils");
const redisClient = require("../utils/redis");
const config = require("../config");

const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
  const user = await findUserByUsername(username);
  if (user) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const created = await createUser(username, hashedPassword);

  res.status(201).json(created);
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

  const user = await findUserByUsername(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken({ id: user.id, username: user.username });
  const refreshToken = generateRefreshToken({ id: user.id, username: user.username });

  await redisClient.set(user.id.toString(), refreshToken);

  res.json({ accessToken, refreshToken });
};

const refresh = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, config.secrets.refreshToken, async (err, user) => {
    if (err) return res.sendStatus(403);

    const storedRefreshToken = await redisClient.get(user.id.toString());
    if (storedRefreshToken !== token) return res.sendStatus(403);

    const accessToken = generateAccessToken({ id: user.id, username: user.username });
    res.json({ accessToken });
  });
};

module.exports = {
  register,
  login,
  refresh,
};
