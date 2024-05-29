const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;

require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const { authenticateToken } = require("./middlewares/authMiddleware");
const redisClient = require("./utils/redis");
const config = require("./config");

const app = express();
app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: config.secrets.session,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using https
  })
);

app.use("/auth", authRoutes);

app.get("/protected", authenticateToken, (req, res) => {
  res.send("This is a protected route");
});

app.listen(8080, (err) => {
  if (err) throw new Error(err);
  console.log("Server is running on port 8080");
});
