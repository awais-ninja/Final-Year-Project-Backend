const router = require("express").Router();
const {
  absoluteDeleteUser,
  getAllUsers,
  getUser,
  markDeleteUser,
  updateUser,
} = require("../controllers/user");

router.route("/").get(getAllUsers);
router.route("/:id").get(getUser).put(updateUser).delete(absoluteDeleteUser);
router.route("/:id/delete").put(markDeleteUser);

module.exports = router;
