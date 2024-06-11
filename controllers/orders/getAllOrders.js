const { allOrders, findOrderById } = require("../../queries/orders");

module.exports = async (req, res) => {
  const orders = await allOrders();

  return res.json({ data: orders, totalOrders: orders?.length || 0 });
};
