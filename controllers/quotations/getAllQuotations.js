const { getAllQuotations } = require("../../queries/quotations");

module.exports = async (req, res) => {
  const quotations = await getAllQuotations();

  return res.json({
    data: quotations,
    quotationsLength: quotations.length || 0,
  });
};
