const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const c = require("../controllers/higherOfficialController");

router.use(protect, authorize("higher_official"));

router.get("/dashboard", c.dashboard);
router.get("/escalations", c.getEscalations);
router.get("/escalations/:id", c.getEscalationById);
router.get("/officers", c.getOfficersList);
router.get("/overdue", c.getOverdue);
router.get("/critical", c.getCritical);

router.patch("/escalations/:id", c.updateEscalation);
router.patch("/escalations/:id/close", c.updateEscalation);
router.patch("/grievances/:id/priority", c.updatePriority);

module.exports = router;
