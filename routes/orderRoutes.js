const router = require("express").Router();
const {
  getAllOrders,
  createOrder,
  getOrder,
  cancelOrder,
} = require("../controllers/orders/index");

router.route("/").post(createOrder).get(getAllOrders);
router.route("/:id").get(getOrder);
router.route("/:id/cancel").post(cancelOrder);

module.exports = router;
