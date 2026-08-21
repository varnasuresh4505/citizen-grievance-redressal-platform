const express = require("express");

const {
  getAssignedGrievances,
  updateGrievanceStatus,
} = require("../controllers/officerController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// GET ASSIGNED GRIEVANCES
// GET /api/officer/grievances
// ======================================================

router.get(
  "/grievances",
  protect,
  authorize("officer"),
  getAssignedGrievances
);

// ======================================================
// UPDATE GRIEVANCE STATUS
// PUT /api/officer/grievances/:id/status
// ======================================================

router.put(
  "/grievances/:id/status",
  protect,
  authorize("officer"),
  updateGrievanceStatus
);

module.exports = router;