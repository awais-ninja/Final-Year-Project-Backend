const { findQuotationByOrderId } = require("../../queries/quotations");
const validateUUID = require("../../utils/validateUUID");

module.exports = async (req, res) => {
  const { id: qId } = req.params;
  const id = qId.trim();

  if (!id || !validateUUID(id)) {
    return res.status(400).json({ message: `provide valid id` });
  }

  const exists = await findQuotationByOrderId(id);
  if (!exists) {
    return res.status(404).json({ message: `Quotation ${id} doesn't exist` });
  }

  return res.json({ data: exists });
};
