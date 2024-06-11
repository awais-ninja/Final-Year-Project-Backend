const router = require("express").Router;
const {
  getAllDeliveries,
  getOneDelivery,
  updateOneDelivery,
} = require("../controllers/deliveries/index");

router.route("/all-deliveries").get(getAllDeliveries);
router.route("/:id/one-delivery").get(getOneDelivery);
router.route("/:id/update-delivery").put(updateOneDelivery);

module.exports = router;
