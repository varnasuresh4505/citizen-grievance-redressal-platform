const express = require("express");

const {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
} = require("../controllers/grievanceController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// CREATE GRIEVANCE
// POST /api/grievances
// ======================================================

router.post("/", protect, authorize("citizen"), createGrievance);

// ======================================================
// GET MY GRIEVANCES
// GET /api/grievances/my
// ======================================================

router.get("/my", protect, authorize("citizen"), getMyGrievances);

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

module.exports = router;