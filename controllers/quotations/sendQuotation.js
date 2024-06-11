const { setSent, findQuotationById } = require("../../queries/quotations");
const validateUUID = require("../../utils/validateUUID");

module.exports = async (req, res) => {
  const { id: qId, explanation } = req.params;
  const id = qId.trim();

  if (!id || !validateUUID(id)) {
    return res.status(400).json({ message: `provide valid id` });
  }

  const exists = await findQuotationById(id);

  if (!exists) {
    return res.status(404).json({
      message: `Quotation ${id} doesn't exist`,
    });
  }

  if (exists.status === "Sent") {
    return res.json({ data: exists });
  }

  const sent = await setSent(exists.quotation_id, explanation);
  if (!sent) {
    return res.status(500).json({
      message: `Something went wrong when setting set status on quotation`,
    });
  }
  return res.json({ data: sent });
};
