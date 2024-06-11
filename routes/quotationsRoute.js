const router = require("express").Router();
const {
  getAllQuotations,
  getOneQuotation,
  confirmQuotation,
  rejectQuotation,
  sendQuotation,
} = require("../controllers/quotations/index");

router.route("/").get(getAllQuotations);
router.route("/:id").get(getOneQuotation);
router.route("/:id/confirm").post(confirmQuotation);
router.route("/:id/reject").post(rejectQuotation);
router.route("/:id/send").post(sendQuotation);

module.exports = router;
