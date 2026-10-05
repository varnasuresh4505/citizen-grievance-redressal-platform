const express = require("express");

const {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  submitFeedback,
  requestReopen,
} = require("../controllers/grievanceController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// CREATE GRIEVANCE
// POST /api/grievances
// ======================================================

router.post(
  "/",
  protect,
  authorize("citizen"),
  createGrievance
);

// ======================================================
// GET MY GRIEVANCES
// GET /api/grievances/my
// ======================================================

router.get(
  "/my",
  protect,
  authorize("citizen"),
  getMyGrievances
);

// ======================================================
// GET SINGLE GRIEVANCE
// GET /api/grievances/:id
// ======================================================

router.get(
  "/:id",
  protect,
  authorize("citizen"),
  getGrievanceById
);

// ======================================================
// SUBMIT CITIZEN FEEDBACK
// POST /api/grievances/:id/feedback
// ======================================================

router.post(
  "/:id/feedback",
  protect,
  authorize("citizen"),
  submitFeedback
);

// ======================================================
// REQUEST REOPEN / APPEAL
// POST /api/grievances/:id/reopen
// ======================================================

router.post(
  "/:id/reopen",
  protect,
  authorize("citizen"),
  requestReopen
);

module.exports = router;