const express = require("express");

const {
  getAllGrievances,
  assignGrievance,
  getDashboardStats,
  getAllOfficers,
  getAdminNotifications,
  getReopenRequests,
  reviewReopenRequest,
  getFeedbackDetails,
  getDepartments,
  saveDepartment,
  getStaff,
  createStaff,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// GET ALL GRIEVANCES
// GET /api/admin/grievances
// ======================================================

router.get("/departments", protect, authorize("admin"), getDepartments);
router.post("/departments", protect, authorize("admin"), saveDepartment);
router.put("/departments/:id", protect, authorize("admin"), saveDepartment);
router.get("/staff", protect, authorize("admin"), getStaff);
router.post("/staff", protect, authorize("admin"), createStaff);

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
// GET /api/admin/officers
// ======================================================

router.get(
  "/officers",
  protect,
  authorize("admin"),
  getAllOfficers
);

// ======================================================
// ADMIN NOTIFICATIONS
// GET /api/admin/notifications
// ======================================================

router.get(
  "/notifications",
  protect,
  authorize("admin"),
  getAdminNotifications
);

// ======================================================
// GET PENDING REOPEN REQUESTS
// GET /api/admin/reopen-requests
// ======================================================

router.get(
  "/reopen-requests",
  protect,
  authorize("admin"),
  getReopenRequests
);

// ======================================================
// REVIEW REOPEN REQUEST
// PUT /api/admin/grievances/:id/reopen-review
// ======================================================

router.put(
  "/grievances/:id/reopen-review",
  protect,
  authorize("admin"),
  reviewReopenRequest
);

// ======================================================
// GET CITIZEN FEEDBACK
// GET /api/admin/feedback
// ======================================================

router.get(
  "/feedback",
  protect,
  authorize("admin"),
  getFeedbackDetails
);

module.exports = router;
