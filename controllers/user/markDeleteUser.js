const { findUserById } = require("../../queries/users");
const pool = require("../../utils/db");
const validateUUID = require("../../utils/validateUUID");

module.exports = async (req, res) => {
  const { id } = req.params;
  const identifier = id.trim();

  if (!identifier || !validateUUID(identifier)) {
    return res.status(400).json({ message: "provide proper id" });
  }

  const exists = await findUserById(identifier);
  if (!exists) {
    return res.status(404).send({ message: "User with that id doesn't exist" });
  }
  if (exists.is_deleted === true) {
    return res
      .status(400)
      .json({ message: `${exists.id} has already been deleted` });
  }
  const {
    rows: [deleted],
  } = await pool.query(
    `UPDATE users SET is_deleted = $1 RETURNING is_deleted`,
    [true]
  );
  if (!deleted) {
    return res
      .status(500)
      .json({ message: "There was a problem marking user as deleted" });
  }
  return res.json({
    message: `${exists.id} has been marked as deleted ${deleted.is_deleted}`,
  });
};
