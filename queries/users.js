const pool = require("../utils/db");

const createUser = async (username, password) => {
  const query = "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *";
  const values = [username, password];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const findUserByUsername = async (username) => {
  const query = "SELECT * FROM users WHERE username = $1";
  const values = [username];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

module.exports = {
  createUser,
  findUserByUsername,
};
