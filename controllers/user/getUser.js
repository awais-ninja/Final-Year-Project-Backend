const { findUserById } = require("../../queries/users");
const validateUUID = require("../../utils/validateUUID");
module.exports = async (req, res) => {
  const { id } = req.params;
  const identifier = id.trim();

  if (!identifier || identifier == "" || !validateUUID(identifier)) {
    return res.status(400).json({ message: "provide proper id" });
  }
  const exists = await findUserById(identifier);

  if (exists.rows === 0) {
    return res
      .status(404)
      .json({ message: "The user with that id doesn't exist" });
  }
  return res.json({ data: exists });
};
