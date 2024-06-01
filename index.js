const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("express-async-errors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const validateToken = require("./middlewares/authMiddleware");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use("/auth", authRoutes);

app.get("/protected", validateToken, (req, res) => {
  res.json({ message: "This is a protected route" });
});

app.listen(config.port, (err) => {
  if (err) throw new Error(err);
  console.log(`Server is running on port ${config.port}`);
});
