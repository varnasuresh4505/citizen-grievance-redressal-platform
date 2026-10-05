const express = require("express");

const {
  assignTasks,
  getMyTasks,
  updateTaskStatus,
  getGrievanceTasks,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// OFFICER
// Assign one or multiple employees to a grievance
// ======================================================

router.post(
  "/assign",
  protect,
  authorize("officer"),
  assignTasks
);

// ======================================================
// EMPLOYEE
// Get tasks assigned to logged-in employee
// ======================================================

router.get(
  "/my-tasks",
  protect,
  authorize("employee"),
  getMyTasks
);

// ======================================================
// EMPLOYEE
// Update task status
// ======================================================

router.put(
  "/:id/status",
  protect,
  authorize("employee"),
  updateTaskStatus
);

// ======================================================
// OFFICER
// View all employee tasks for a grievance
// ======================================================

router.get(
  "/grievance/:grievanceId",
  protect,
  authorize("officer"),
  getGrievanceTasks
);

module.exports = router;