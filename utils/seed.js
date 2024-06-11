const pool = require("./db");
const path = require("path");
const fs = require("fs");

const seed = async () => {
  const relPath = path.join(__dirname, "seed.sql");
  const data = fs?.readFileSync(relPath, "utf-8");
  return data;
};

module.exports = seed;
