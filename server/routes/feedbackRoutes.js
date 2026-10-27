const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { createFeedback, getFeedbackByGrievance } = require("../controllers/feedbackController");
router.post("/", protect, authorize("citizen"), createFeedback);
router.get("/grievance/:grievanceId", protect, getFeedbackByGrievance);
module.exports = router;
