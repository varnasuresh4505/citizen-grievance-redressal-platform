const express = require("express");

const {
  getAllGrievances,
  assignGrievance,
  getDashboardStats,
  getAllOfficers,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// GET ALL GRIEVANCES
// GET /api/admin/grievances
// ======================================================

router.get(
  "/grievances",
  protect,
  authorize("admin"),
  getAllGrievances
);

// ======================================================
// ADMIN DASHBOARD STATISTICS
// GET /api/admin/dashboard
// ======================================================

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboardStats
);

// ======================================================
// ASSIGN GRIEVANCE TO OFFICER
// PUT /api/admin/grievances/:id/assign
// ======================================================

router.put(
  "/grievances/:id/assign",
  protect,
  authorize("admin"),
  assignGrievance
);

// ======================================================
// GET ALL OFFICERS
// Admin only
// GET /api/admin/officers
// ======================================================

router.get(
  "/officers",
  protect,
  authorize("admin"),
  getAllOfficers
);

module.exports = router;