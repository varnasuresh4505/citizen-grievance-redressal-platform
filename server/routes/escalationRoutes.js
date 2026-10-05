const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { createEscalation } = require("../controllers/escalationController");
router.post("/", protect, authorize("citizen"), createEscalation);
module.exports = router;
