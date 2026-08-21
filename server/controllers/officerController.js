const Grievance = require("../models/Grievance");

// ======================================================
// GET ASSIGNED GRIEVANCES
// ======================================================

const getAssignedGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({
      assignedOfficer: req.user.userId,
    })
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email phone")
      .sort({ createdAt: -1 });

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
// UPDATE GRIEVANCE STATUS
// ======================================================

const updateGrievanceStatus = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const grievanceId = req.params.id;

    // Allowed statuses
    const allowedStatuses = [
      "Assigned",
      "In Progress",
      "Resolved",
    ];

    // Check status
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Allowed values: Assigned, In Progress, Resolved",
      });
    }

    // Find grievance
    const grievance = await Grievance.findById(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    // Make sure this grievance belongs to this officer
    if (
      !grievance.assignedOfficer ||
      grievance.assignedOfficer.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not assigned to this grievance",
      });
    }

    // Update status
    grievance.status = status;

    // Add resolution when resolving
    if (status === "Resolved") {
      if (!resolution || resolution.trim() === "") {
        return res.status(400).json({
          message: "Resolution message is required when resolving a grievance",
        });
      }

      grievance.resolution = resolution.trim();
      grievance.resolvedAt = new Date();
    }

    // If moving back from Resolved
    if (status !== "Resolved") {
      grievance.resolvedAt = null;
    }

    await grievance.save();

    const updatedGrievance = await Grievance.findById(grievanceId)
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email phone");

    res.status(200).json({
      message: "Grievance status updated successfully",
      grievance: updatedGrievance,
    });
  } catch (error) {
    console.error("Update grievance status error:", error);

    res.status(500).json({
      message: "Server error while updating grievance status",
    });
  }
};

module.exports = {
  getAssignedGrievances,
  updateGrievanceStatus,
};