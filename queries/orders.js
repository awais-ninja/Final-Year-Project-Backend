const pool = require("../utils/db");

const findOrderById = async (id) => {
  const res = await pool.query(`SELECT * FROM orders WHERE order_id = $1`, [
    id,
  ]);
  return res.rows[0];
};

const allOrders = async () => {
  const res = await pool.query(`SELECT * FROM orders;`);
  return res.rows;
};

const findSameOrder = async ({ addressFrom, addressTo, weight }) => {
  if (!addressFrom || !addressTo || !weight) {
    throw new Error(`Provide addressFrom, addressTo and weight`);
  }

  const res = await pool.query(
    `SELECT * FROM orders WHERE address_from = $1 AND address_to = $2 AND weight = $3`,
    [addressFrom, addressTo, weight]
  );
  return res.rows[0];
};

const createOrder = async ({
  userId,
  addressFrom,
  addressTo,
  weight,
  instructions,
}) => {
  const res = await pool.query(
    `INSERT INTO orders (user_id, address_from, address_to, weight, instructions) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, addressFrom, addressTo, weight, instructions]
  );
  return res.rows[0];
};

const cancelOrder = async (id) => {
  const res = await pool.query(
    `UPDATE orders SET status = $1 where order_id = $2 RETURNING *`,
    ["Cancelled", id]
  );
  return res.rows[0];
};

module.exports = {
  findOrderById,
  allOrders,
  findSameOrder,
  createOrder,
  cancelOrder,
};
