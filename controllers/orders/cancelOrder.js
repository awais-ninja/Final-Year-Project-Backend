const {
  allOrders,
  findOrderById,
  cancelOrder,
} = require("../../queries/orders");
const validateUUID = require("../../utils/validateUUID");

module.exports = async (req, res) => {
  const { id } = req.params;
  if (!id || !validateUUID(id.trim())) {
    return res.status(400).json({ message: "provide valid id" });
  }
  const exists = await findOrderById(id);
  if (!exists) {
    return res.status(400).json({ message: `order ${id} doesn't exist` });
  }
  const cancelled = await cancelOrder(id);
  if (cancelled.status !== "Cancelled") {
    return res
      .status(500)
      .json({ message: `There was a problem cancelling the order` });
  }

  return res.json({ message: `${id} has been cancelled` });
};
