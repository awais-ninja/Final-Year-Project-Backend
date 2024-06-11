const { allOrders, findOrderById } = require("../../queries/orders");
const validateUUID = require("../../utils/validateUUID");

module.exports = async (req, res) => {
  const { id: oId } = req.params;
  const id = oId.trim();

  if (!id || !validateUUID(id)) {
    return res.status(400).json({ message: "provide a valid id" });
  }

  const order = await findOrderById(id);
  if (!order) {
    return res.status(404).json({ msg: `Order with ${id} doesn't exist` });
  }
  return res.json({ data: order });
};
