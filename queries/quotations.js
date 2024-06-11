const pool = require("../utils/db");

const getAllQuotations = async () => {
  const res = await pool.query(`SELECT * FROM quotations;`);
  return res.rows;
};

const findQuotationById = async (id) => {
  const res = await pool.query(
    `SELECT * FROM quotations WHERE quotation_id = $1`,
    [id]
  );
  return res.rows[0];
};

const findQuotationByOrderId = async (id) => {
  const res = await pool.query(`SELECT * FROM quotations WHERE order_id = $1`, [
    id,
  ]);
  return res.rows[0];
};

const setConfirmed = async (id) => {
  const res = await pool.query(
    `UPDATE quotations SET status = $1 WHERE quotation_id = $2 RETURNING *`,
    ["Confirmed", id]
  );
  return res.rows[0];
};

const setSent = async (id, message) => {
  const res = await pool.query(
    `UPDATE quotations SET status = $1, cost_explanation = $2 WHERE quotation_id = $3 RETURNING *`,
    ["Sent", message, id]
  );
  return res.rows[0];
};

const setDeclined = async (id, message) => {
  const res = await pool.query(
    `UPDATE quotations SET status = $1, client_response = $2 WHERE quotation_id = $3 RETURNING *`,
    ["Declined", message, id]
  );
  return res.rows[0];
};

module.exports = {
  getAllQuotations,
  findQuotationById,
  findQuotationByOrderId,
  setConfirmed,
  setDeclined,
  setSent,
};
