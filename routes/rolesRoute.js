const router = require("express").Router;
const { getAllRole, getOneRole, updateRole } = require("../controllers/roles");

router.route("/all-role").get(getAllRole);
router.route("/:id/one-role").get(getOneRole);
router.route("/:id/update-role").put(updateRole);

module.exports = router;
