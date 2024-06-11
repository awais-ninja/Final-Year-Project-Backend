const { findQuotationById, setConfirmed } = require("../../queries/quotations");
const validateUUID = require("../../utils/validateUUID");

module.exports = async (req, res) => {
  const { id: qId } = req.params;
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
  if (exists.status === "Confirmed") {
    return res.json({ data: exists });
  }

  const confirmed = await setConfirmed(exists.quotation_id);

  if (!confirmed) {
    return res
      .status(500)
      .json({ message: "Something went wrong while confirming the quotation" });
  }
  return res.json({ data: confirmed });
};
