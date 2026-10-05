const express = require("express");

const {
  getAssignedGrievances,
  getMyEmployees,
  getOfficerGrievanceById,
  updateGrievanceStatus,
  reviewGrievance,
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

router.get("/employees/workload", protect, authorize("officer"), getMyEmployees);

// ======================================================
// GET SINGLE GRIEVANCE
// GET /api/officer/grievances/:id
// ======================================================

router.get(
  "/grievances/:id",
  protect,
  authorize("officer"),
  getOfficerGrievanceById
);

// ======================================================
// GET EMPLOYEES WORKING UNDER OFFICER
// GET /api/officer/employees
// ======================================================

router.get(
  "/employees",
  protect,
  authorize("officer"),
  getMyEmployees
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

router.patch("/grievances/:id/review", protect, authorize("officer"), reviewGrievance);

module.exports = router;
