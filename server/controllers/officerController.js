const Grievance = require("../models/Grievance");
const User = require("../models/User");
const Task = require("../models/Task");
const { addHistory, notify } = require("../services/workflowService");
const Department = require("../models/Department");

// ======================================================
// GET ASSIGNED GRIEVANCES
// ======================================================

const getAssignedGrievances = async (req, res) => {
  try {
    const rawGrievances = await Grievance.find({
      assignedOfficer: req.user.userId,
    })
      .populate("citizen", "name email phone address")
      .populate("assignedOfficer", "name email phone designation")
      .populate("department", "name code description")
      .sort({ createdAt: -1 });

    const now = new Date();
    const Escalation = require("../models/Escalation");

    const grievances = await Promise.all(
      rawGrievances.map(async (g) => {
        const isPastDue = g.dueDate && now > new Date(g.dueDate);
        const isUnresolved = !["Resolved", "Closed", "Rejected"].includes(g.status);

        if (isPastDue && isUnresolved && g.status !== "Overdue") {
          g.status = "Overdue";
          await g.save();
        }

        const overdueDays = (isPastDue && isUnresolved)
          ? Math.max(1, Math.ceil((now - new Date(g.dueDate)) / (1000 * 60 * 60 * 24)))
          : 0;

        const escalation = await Escalation.findOne({ grievance: g._id })
          .populate("higherOfficial", "name email designation")
          .lean();

        const plain = g.toObject();
        plain.isOverdue = isPastDue && isUnresolved;
        plain.overdueDays = overdueDays;
        plain.escalation = escalation || null;
        return plain;
      })
    );

    res.status(200).json({
      count: grievances.length,
      grievances,
    });
  } catch (error) {
    console.error("Get assigned grievances error:", error);
    res.status(500).json({
      message: "Server error while fetching assigned grievances",
    });
  }
};

// ======================================================
// GET EMPLOYEES WORKING UNDER LOGGED-IN OFFICER
// ======================================================

const getMyEmployees = async (req, res) => {
  try {
    const officer = await User.findById(
      req.user.userId
    );

    if (!officer) {
      return res.status(404).json({
        message: "Officer not found",
      });
    }

    // --------------------------------------------------
    // CHECK ROLE
    // --------------------------------------------------

    if (officer.role !== "officer") {
      return res.status(403).json({
        message:
          "Only officers can view department employees",
      });
    }

    // --------------------------------------------------
    // FIND EMPLOYEES
    // --------------------------------------------------

    const employees = await User.find({
      role: "employee",
      departmentId: officer.departmentId,
      officerId: officer._id,
      isActive: true,
    }).select(
      "name email phone departmentId officerId isActive"
    );

    const active = await Task.aggregate([{ $match: { employee: { $in: employees.map((employee) => employee._id) }, status: { $in: ["Assigned", "Accepted", "In Progress", "On Hold"] } } }, { $group: { _id: "$employee", count: { $sum: 1 } } }]);
    const workload = new Map(active.map((entry) => [entry._id.toString(), entry.count]));
    const employeesWithWorkload = employees.map((employee) => { const activeTasks = workload.get(employee._id.toString()) || 0; return { ...employee.toObject(), activeTasks, availability: activeTasks <= 2 ? "Available" : activeTasks <= 5 ? "Busy" : "Overloaded" }; });
    res.status(200).json({
      count: employees.length,
      employees: employeesWithWorkload,
    });
  } catch (error) {
    console.error(
      "Get employees error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching employees",
    });
  }
};

// ======================================================
// GET SINGLE GRIEVANCE FOR OFFICER
// ======================================================

const getOfficerGrievanceById = async (
  req,
  res
) => {
  try {
    const grievance =
      await Grievance.findById(
        req.params.id
      )
        .populate(
          "citizen",
          "name email phone address"
        )
        .populate(
          "assignedOfficer",
          "name email phone"
        )
        .populate(
          "department",
          "name description"
        );

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    // --------------------------------------------------
    // OFFICER AUTHORIZATION
    // --------------------------------------------------

    if (
      !grievance.assignedOfficer ||
      grievance.assignedOfficer._id.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not assigned to this grievance",
      });
    }

    // --------------------------------------------------
    // GET EMPLOYEE TASKS
    // --------------------------------------------------

    const tasks = await Task.find({
      grievance: grievance._id,
    })
      .populate(
        "employee",
        "name email phone"
      )
      .populate(
        "assignedBy",
        "name email phone"
      );

    res.status(200).json({
      grievance,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get officer grievance error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching grievance",
    });
  }
};

// ======================================================
// UPDATE GRIEVANCE STATUS
// ======================================================

const updateGrievanceStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
      resolution,
    } = req.body;

    const grievanceId = req.params.id;

    // --------------------------------------------------
    // ALLOWED STATUSES
    // --------------------------------------------------

    const allowedStatuses = ["Under Review", "Assigned", "In Progress", "On Hold", "Resolved", "Closed", "Rejected"];

    if (
      !status ||
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid status",
      });
    }

    // --------------------------------------------------
    // FIND GRIEVANCE
    // --------------------------------------------------

    const grievance =
      await Grievance.findById(
        grievanceId
      );

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    // --------------------------------------------------
    // OFFICER AUTHORIZATION
    // --------------------------------------------------

    if (
      !grievance.assignedOfficer ||
      grievance.assignedOfficer.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not assigned to this grievance",
      });
    }

    // --------------------------------------------------
    // ON HOLD REASON
    // --------------------------------------------------

    if (status === "On Hold") {
      const reason = (req.body.onHoldReason || req.body.reason || resolution || "").trim();
      if (!reason) {
        return res.status(400).json({
          message: "Please enter the reason for putting the grievance on hold (e.g. awaiting external verification or parts)",
        });
      }
      grievance.onHoldReason = reason;
    }

    // --------------------------------------------------
    // RESOLUTION
    // --------------------------------------------------

    if (status === "Resolved") {
      if (
        !resolution ||
        resolution.trim() === ""
      ) {
        return res.status(400).json({
          message:
            "Resolution message is required when resolving a grievance",
        });
      }

      grievance.resolution =
        resolution.trim();

      grievance.resolvedAt =
        new Date();

      if (Array.isArray(req.body.resolutionProof)) {
        grievance.resolutionProof = req.body.resolutionProof;
      }
    }

    // --------------------------------------------------
    // RESET RESOLUTION IF NOT RESOLVED
    // --------------------------------------------------

    if (status !== "Resolved") {
      grievance.resolvedAt = null;
    }

    grievance.status = status;

    if (status === "Closed") grievance.closedAt = new Date();

    await grievance.save();
    await addHistory(grievance, status === "Resolved" ? "Grievance Resolved" : `Status Changed to ${status}`, req.user, resolution || "");
    await notify(grievance.citizen, grievance, status === "Resolved" ? "GRIEVANCE_RESOLVED" : "STATUS_CHANGED", `Your grievance ${grievance.grievanceId} is now ${status}.`);

    const updatedGrievance =
      await Grievance.findById(
        grievanceId
      )
        .populate(
          "citizen",
          "name email phone"
        )
        .populate(
          "assignedOfficer",
          "name email phone"
        )
        .populate(
          "department",
          "name description"
        );

    res.status(200).json({
      message:
        "Grievance status updated successfully",

      grievance:
        updatedGrievance,
    });
  } catch (error) {
    console.error(
      "Update grievance status error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating grievance status",
    });
  }
};

// The recommendation is advisory. This endpoint records the officer's official review.
const reviewGrievance = async (req, res) => {
  try {
    const { category, priority, departmentId, dueDate, status = "Under Review", remark = "" } = req.body;
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return res.status(404).json({ message: "Grievance not found" });
    if (grievance.assignedOfficer?.toString() !== req.user.userId) return res.status(403).json({ message: "You are not assigned to this grievance" });
    if (category && !Grievance.schema.path("category").enumValues.includes(category)) return res.status(400).json({ message: "Invalid category" });
    if (priority && !["Low", "Medium", "High", "Critical"].includes(priority)) return res.status(400).json({ message: "Invalid priority" });
    if (departmentId) {
      const department = await Department.findOne({ _id: departmentId, isActive: true });
      if (!department) return res.status(400).json({ message: "Invalid department" });
      grievance.department = department._id;
    }
    if (category) grievance.category = category;
    if (priority) grievance.priority = priority;
    if (dueDate) {
      const deadline = new Date(dueDate);
      if (Number.isNaN(deadline.valueOf()) || deadline <= new Date()) return res.status(400).json({ message: "Deadline must be a future date" });
      grievance.dueDate = deadline;
    }
    if (!["Under Review", "Assigned", "In Progress", "On Hold"].includes(status)) return res.status(400).json({ message: "Invalid review status" });
    grievance.status = status;
    await grievance.save();
    await addHistory(grievance, "Officer Review Completed", req.user, remark || "Officer confirmed or modified the recommendation.");
    await notify(grievance.citizen, grievance, "STATUS_CHANGED", `Your grievance ${grievance.grievanceId} is under officer review.`);
    res.json({ message: "Grievance review saved", grievance });
  } catch (_) { res.status(500).json({ message: "Server error while reviewing grievance" }); }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getAssignedGrievances,
  getMyEmployees,
  getOfficerGrievanceById,
  updateGrievanceStatus,
  reviewGrievance,
};
