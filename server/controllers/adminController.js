const Grievance = require("../models/Grievance");
const User = require("../models/User");
const Department = require("../models/Department");
const bcrypt = require("bcryptjs");

const categoryDepartmentCodes = {
  "Water Supply": "WATER",
  "Sanitation & Waste Management": ["SANIT", "SWM"],
  "Roads & Street Infrastructure": "ROADS",
  "Street Lighting & Electricity": ["LIGHT", "ELECTRIC"],
  "Public Health": "HEALTH",
  "Municipal / Local Administration": "ADMIN",
  "Animal Welfare": "OTHER",
  "Environment & Public Spaces": "OTHER",
  "Other Government Services": "OTHER",
};

// ======================================================
// GET ALL GRIEVANCES
// Admin only
// ======================================================

const getAllGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find()
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email phone")
      .populate("department", "name code")
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

    if (!officerId) {
      return res.status(400).json({
        message: "Officer ID is required",
      });
    }

    const officer = await User.findById(officerId);

    if (!officer) {
      return res.status(404).json({
        message: "Officer not found",
      });
    }

    if (officer.role !== "officer") {
      return res.status(400).json({
        message: "Selected user is not an officer",
      });
    }

    const grievance = await Grievance.findById(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    const departmentCodes = categoryDepartmentCodes[grievance.category];
    const categoryDepartments = grievance.department
      ? [await Department.findById(grievance.department)]
      : await Department.find({ code: { $in: Array.isArray(departmentCodes) ? departmentCodes : [departmentCodes] }, isActive: true });
    const departmentIds = categoryDepartments.filter(Boolean).map((department) => department._id.toString());

    if (!departmentIds.length) {
      return res.status(400).json({ message: "No department is configured for this grievance category" });
    }

    if (!departmentIds.includes(officer.departmentId?.toString())) {
      return res.status(400).json({ message: "Select an officer from the grievance's department" });
    }

    grievance.assignedOfficer = officerId;
    grievance.department = officer.departmentId;
    grievance.status = "Assigned";

    await grievance.save();

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

    const reopened = await Grievance.countDocuments({
      status: "Reopened",
    });

    // Number of grievances that received feedback
    const feedbackCount = await Grievance.countDocuments({
      "feedback.submittedAt": { $ne: null },
    });

    // Number of dissatisfied citizens
    const dissatisfiedCount = await Grievance.countDocuments({
      "feedback.resolved": { $in: ["Partially", "No"] },
    });

    // Number of pending reopen requests
    const pendingReopenRequests = await Grievance.countDocuments({
      "reopenRequest.status": "Pending",
    });

    // Average rating
    const ratingResult = await Grievance.aggregate([
      {
        $match: {
          "feedback.rating": { $gte: 1 },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$feedback.rating" },
        },
      },
    ]);

    const averageRating =
      ratingResult.length > 0
        ? Number(ratingResult[0].averageRating.toFixed(1))
        : 0;

    // Resolution rate
    const resolutionRate =
      total > 0
        ? Number(((resolved / total) * 100).toFixed(1))
        : 0;

    res.status(200).json({
      total,
      pending,
      assigned,
      inProgress,
      resolved,
      reopened,

      feedbackCount,
      dissatisfiedCount,
      pendingReopenRequests,

      averageRating,
      resolutionRate,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message: "Server error while fetching dashboard statistics",
    });
  }
};

// ======================================================
// GET ALL OFFICERS
// Admin only
// ======================================================

const getAllOfficers = async (req, res) => {
  try {
    const departmentCodes = categoryDepartmentCodes[req.query.category];
    const departments = departmentCodes
      ? await Department.find({ code: { $in: Array.isArray(departmentCodes) ? departmentCodes : [departmentCodes] }, isActive: true })
      : [];

    const officers = await User.find(
      {
        role: "officer",
        isActive: true,
        ...(departments.length ? { departmentId: { $in: departments.map((department) => department._id) } } : {}),
      },
      "name email phone departmentId"
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

// ======================================================
// GET FEEDBACK / NOTIFICATIONS
// Admin only
// ======================================================

const getAdminNotifications = async (req, res) => {
  try {
    // Feedback submitted by citizens
    const feedback = await Grievance.find({
      "feedback.submittedAt": { $ne: null },
    })
      .populate("citizen", "name email")
      .populate("assignedOfficer", "name email")
      .select(
        "title status citizen assignedOfficer feedback createdAt"
      )
      .sort({ "feedback.submittedAt": -1 });

    // Reopen requests
    const reopenRequests = await Grievance.find({
      "reopenRequest.status": "Pending",
    })
      .populate("citizen", "name email")
      .populate("assignedOfficer", "name email")
      .select(
        "title status citizen assignedOfficer reopenRequest createdAt"
      )
      .sort({ "reopenRequest.requestedAt": -1 });

    res.status(200).json({
      feedback,
      reopenRequests,

      notificationCount:
        feedback.length + reopenRequests.length,
    });
  } catch (error) {
    console.error(
      "Get admin notifications error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching admin notifications",
    });
  }
};

// ======================================================
// GET REOPEN REQUESTS
// Admin only
// ======================================================

const getReopenRequests = async (req, res) => {
  try {
    const requests = await Grievance.find({
      "reopenRequest.status": "Pending",
    })
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email phone")
      .sort({ "reopenRequest.requestedAt": -1 });

    res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Get reopen requests error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching reopen requests",
    });
  }
};

// ======================================================
// REVIEW REOPEN REQUEST
// Admin only
// ======================================================

const reviewReopenRequest = async (req, res) => {
  try {
    const { decision, adminResponse } = req.body;
    const grievanceId = req.params.id;

    if (!["Approved", "Rejected"].includes(decision)) {
      return res.status(400).json({
        message:
          "Decision must be Approved or Rejected",
      });
    }

    const grievance = await Grievance.findById(
      grievanceId
    );

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    if (
      grievance.reopenRequest?.status !==
      "Pending"
    ) {
      return res.status(400).json({
        message:
          "This grievance does not have a pending reopen request",
      });
    }

    grievance.reopenRequest.status = decision;

    grievance.reopenRequest.reviewedAt =
      new Date();

    grievance.reopenRequest.adminResponse =
      adminResponse || "";

    // If approved, reopen the grievance
    if (decision === "Approved") {
      grievance.status = "Reopened";
      grievance.resolvedAt = null;
    }

    await grievance.save();

    const updatedGrievance =
      await Grievance.findById(grievanceId)
        .populate(
          "citizen",
          "name email phone"
        )
        .populate(
          "assignedOfficer",
          "name email phone"
        );

    res.status(200).json({
      message:
        decision === "Approved"
          ? "Reopen request approved successfully"
          : "Reopen request rejected successfully",

      grievance: updatedGrievance,
    });
  } catch (error) {
    console.error(
      "Review reopen request error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while reviewing reopen request",
    });
  }
};

// ======================================================
// GET FEEDBACK DETAILS
// Admin only
// ======================================================

const getFeedbackDetails = async (req, res) => {
  try {
    const grievances = await Grievance.find({
      "feedback.submittedAt": { $ne: null },
    })
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email phone")
      .sort({ "feedback.submittedAt": -1 });

    res.status(200).json({
      count: grievances.length,
      grievances,
    });
  } catch (error) {
    console.error(
      "Get feedback details error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching feedback details",
    });
  }
};

// ======================================================
// EXPORT FUNCTIONS
// ======================================================

const getDepartments = async (_req, res) => res.json({ departments: await Department.find().sort({ name: 1 }) });
const saveDepartment = async (req, res) => {
  const { name, code, description = "", isActive = true } = req.body;
  if (!name?.trim() || !code?.trim()) return res.status(400).json({ message: "Department name and code are required" });
  const department = req.params.id ? await Department.findByIdAndUpdate(req.params.id, { name: name.trim(), code: code.trim(), description, isActive }, { new: true, runValidators: true }) : await Department.create({ name: name.trim(), code: code.trim(), description, isActive });
  if (!department) return res.status(404).json({ message: "Department not found" });
  res.status(req.params.id ? 200 : 201).json({ department });
};
const getStaff = async (_req, res) => res.json({ users: await User.find({ role: { $in: ["officer", "employee", "higher_official"] } }).populate("departmentId officerId", "name").sort({ role: 1, name: 1 }) });
const createStaff = async (req, res) => {
  const { name, email, phone, password, role, departmentId, officerId, designation = "" } = req.body;
  if (!name || !email || !phone || !password || !["officer", "employee", "higher_official"].includes(role)) return res.status(400).json({ message: "Name, email, phone, password, and a valid staff role are required" });
  if (role !== "higher_official" && !departmentId) return res.status(400).json({ message: "Department is required" });
  if (departmentId && !await Department.findOne({ _id: departmentId, isActive: true })) return res.status(400).json({ message: "Invalid department" });
  if (role === "employee" && !await User.findOne({ _id: officerId, role: "officer", departmentId, isActive: true })) return res.status(400).json({ message: "Select an active officer in the same department" });
  if (await User.findOne({ email: email.trim().toLowerCase() })) return res.status(409).json({ message: "Email already exists" });
  const user = await User.create({ name, email: email.trim().toLowerCase(), phone, password: await bcrypt.hash(password, 10), role, departmentId: departmentId || null, officerId: officerId || null, designation, isActive: true });
  res.status(201).json({ user });
};

module.exports = {
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
};
