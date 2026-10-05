const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { createFeedback } = require("../controllers/feedbackController");
router.post("/", protect, authorize("citizen"), createFeedback);
module.exports = router;
