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

  if (exists.isDeleted === false) {
    return res
      .status(403)
      .json({ message: "Make this user as deleted first." });
  }

  const deleted = await pool.query(
    `DELETE FROM users CASCADE WHERE id = $1 RETURNING *`,
    [identifier]
  );

  if (deleted.rows < 1) {
    return res
      .status(500)
      .json({ message: "Something went wrong while deleting this user" });
  }

  return res.json({ message: `${exists.id} has been deleted completely` });
};
