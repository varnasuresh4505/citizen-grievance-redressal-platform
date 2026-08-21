const Grievance = require("../models/Grievance");
const User = require("../models/User");

// ======================================================
// GET ALL GRIEVANCES
// Admin only
// ======================================================

const getAllGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find()
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: grievances.length,
      grievances,
    });
  } catch (error) {
    console.error("Get all grievances error:", error);

    res.status(500).json({
      message: "Server error while fetching grievances",
    });
  }
};

// ======================================================
// ASSIGN GRIEVANCE TO OFFICER
// Admin only
// ======================================================

const assignGrievance = async (req, res) => {
  try {
    const { officerId } = req.body;
    const grievanceId = req.params.id;

    // Check officer ID
    if (!officerId) {
      return res.status(400).json({
        message: "Officer ID is required",
      });
    }

    // Find officer
    const officer = await User.findById(officerId);

    if (!officer) {
      return res.status(404).json({
        message: "Officer not found",
      });
    }

    // Make sure selected user is actually an officer
    if (officer.role !== "officer") {
      return res.status(400).json({
        message: "Selected user is not an officer",
      });
    }

    // Find grievance
    const grievance = await Grievance.findById(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    // Assign officer
    grievance.assignedOfficer = officerId;

    // Change status
    grievance.status = "Assigned";

    await grievance.save();

    // Get updated grievance
    const updatedGrievance = await Grievance.findById(grievanceId)
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email phone");

    res.status(200).json({
      message: "Grievance assigned successfully",
      grievance: updatedGrievance,
    });
  } catch (error) {
    console.error("Assign grievance error:", error);

    res.status(500).json({
      message: "Server error while assigning grievance",
    });
  }
};

// ======================================================
// ADMIN DASHBOARD STATISTICS
// Admin only
// ======================================================

const getDashboardStats = async (req, res) => {
  try {
    const total = await Grievance.countDocuments();

    const pending = await Grievance.countDocuments({
      status: "Pending",
    });

    const assigned = await Grievance.countDocuments({
      status: "Assigned",
    });

    const inProgress = await Grievance.countDocuments({
      status: "In Progress",
    });

    const resolved = await Grievance.countDocuments({
      status: "Resolved",
    });

    res.status(200).json({
      total,
      pending,
      assigned,
      inProgress,
      resolved,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message: "Server error while fetching dashboard statistics",
    });
  }
};

// ======================================================
// EXPORT FUNCTIONS
// ======================================================

// ======================================================
// GET ALL OFFICERS
// Admin only
// ======================================================

const getAllOfficers = async (req, res) => {
  try {
    const officers = await User.find(
      { role: "officer" },
      "name email phone"
    );

    res.status(200).json({
      count: officers.length,
      officers,
    });
  } catch (error) {
    console.error("Get all officers error:", error);

    res.status(500).json({
      message: "Server error while fetching officers",
    });
  }
};

module.exports = {
  getAllGrievances,
  assignGrievance,
  getDashboardStats,
  getAllOfficers,
};