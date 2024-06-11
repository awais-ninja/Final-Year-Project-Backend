const pool = require("../utils/db");

const createUser = async (username, email, password) => {
  const res = await pool.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [username, email, password]
  );
  return res.rows[0];
};

const findUserByUsername = async (username) => {
  const res = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return res.rows[0];
};

const findUserByEmail = async (email) => {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
};
const findUserById = async (id) => {
  const res = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return res.rows[0];
};

const updateUserLoginInfo = async (
  id,
  lastLogin,
  lastIp,
  lastDevice,
  lastLocation
) => {
  const res = await pool.query(
    `UPDATE users 
     SET last_login = $1, last_ip = $2, last_device = $3, last_location = $4, updated_on = CURRENT_TIMESTAMP 
     WHERE id = $5 RETURNING *`,
    [lastLogin, lastIp, lastDevice, lastLocation, id]
  );
  return res.rows[0];
};

const getAllUsers = async () => {
  const { rows } = await pool.query(`SELECT * FROM users ORDER BY created_on`);
  return rows;
};

module.exports = {
  getAllUsers,
  createUser,
  findUserByUsername,
  findUserByEmail,
  updateUserLoginInfo,
  findUserById,
};
