const {
  findOrderById,
  findSameOrder,
  createOrder,
} = require("../../queries/orders");
const validateUUID = require("../../utils/validateUUID");

module.exports = async (req, res) => {
  const { userId, addressFrom, addressTo, weight, instructions } = req.body;
  if (!userId || !validateUUID(userId)) {
    return res.status(400).json({ message: `provide proper user id` });
  }
  if (!weight || !addressFrom || !addressTo) {
    return res
      .status(400)
      .json({ message: `weight, addressTo, addressFrom are required` });
  }

  const orderExists = await findSameOrder({ ...req.body });
  if (orderExists) {
    return res
      .status(400)
      .json({ message: `order ${orderExists.order_id} is already booked` });
  }

  const created = await createOrder({
    ...req.body,
    instructions: instructions || "",
  });
  console.log(created);
  if (!created) {
    return res
      .status(500)
      .json({ message: "There was a problem creating the order" });
  }

  return res.json({ data: created });
};
