const Escalation = require("../models/Escalation");
const Grievance = require("../models/Grievance");
const GrievanceHistory = require("../models/GrievanceHistory");
const User = require("../models/User");
const Department = require("../models/Department");
const { addHistory, notify } = require("../services/workflowService");

const populateEscalations = async () => {
  const escalations = await Escalation.find()
    .populate({
      path: "grievance",
      populate: [
        { path: "assignedOfficer", select: "name email phone designation departmentId" },
        { path: "department", select: "name code description" },
        { path: "citizen", select: "name email phone address gender differentlyAbled" },
      ],
    })
    .populate("citizen", "name email phone address gender differentlyAbled")
    .populate("higherOfficial", "name email designation")
    .populate("reassignedOfficer", "name email phone designation")
    .sort({ createdAt: -1 });

  const now = new Date();
  return escalations.map((esc) => {
    const obj = esc.toObject();
    if (obj.grievance?.dueDate) {
      obj.currentDaysOverdue = Math.max(
        0,
        Math.ceil((now - new Date(obj.grievance.dueDate)) / (1000 * 60 * 60 * 24))
      );
    } else {
      obj.currentDaysOverdue = obj.daysOverdueAtEscalation || 0;
    }
    return obj;
  });
};

const dashboard = async (req, res) => {
  try {
    const [openEscalations, totalEscalated, overdue, critical, resolved] = await Promise.all([
      Escalation.countDocuments({ status: { $ne: "Closed" } }),
      Escalation.countDocuments(),
      Grievance.countDocuments({ status: "Overdue" }),
      Grievance.countDocuments({ priority: "Critical", status: { $nin: ["Resolved", "Closed"] } }),
      Grievance.countDocuments({ status: "Resolved" }),
    ]);

    res.json({
      openEscalations,
      escalated: totalEscalated,
      overdue,
      critical,
      resolved,
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error", error: error.message });
  }
};

const getEscalations = async (req, res) => {
  try {
    const escalations = await populateEscalations();
    res.json({ escalations });
  } catch (error) {
    res.status(500).json({ message: "Error fetching escalations", error: error.message });
  }
};

const getEscalationById = async (req, res) => {
  try {
    const escalation = await Escalation.findById(req.params.id)
      .populate({
        path: "grievance",
        populate: [
          { path: "assignedOfficer", select: "name email phone designation departmentId" },
          { path: "department", select: "name code description" },
          { path: "citizen", select: "name email phone address gender differentlyAbled" },
        ],
      })
      .populate("citizen", "name email phone address gender differentlyAbled")
      .populate("higherOfficial", "name email designation")
      .populate("reassignedOfficer", "name email phone designation");

    if (!escalation) {
      return res.status(404).json({ message: "Escalation not found" });
    }

    const history = await GrievanceHistory.find({ grievance: escalation.grievance._id })
      .populate("updatedBy", "name role designation")
      .sort({ createdAt: 1 });

    const now = new Date();
    const obj = escalation.toObject();
    if (obj.grievance?.dueDate) {
      obj.currentDaysOverdue = Math.max(
        0,
        Math.ceil((now - new Date(obj.grievance.dueDate)) / (1000 * 60 * 60 * 24))
      );
    } else {
      obj.currentDaysOverdue = obj.daysOverdueAtEscalation || 0;
    }

    res.json({ escalation: obj, history });
  } catch (error) {
    res.status(500).json({ message: "Error fetching escalation detail", error: error.message });
  }
};

const getOfficersList = async (req, res) => {
  try {
    const officers = await User.find({ role: "officer", isActive: true })
      .populate("departmentId", "name code")
      .select("name email phone designation departmentId")
      .sort({ name: 1 });
    res.json({ officers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching officers list", error: error.message });
  }
};

const getOverdue = async (req, res) => {
  try {
    const grievances = await Grievance.find({ status: "Overdue" })
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email phone designation")
      .populate("department", "name code")
      .sort({ dueDate: 1 });
    res.json({ grievances });
  } catch (error) {
    res.status(500).json({ message: "Error fetching overdue grievances", error: error.message });
  }
};

const getCritical = async (req, res) => {
  try {
    const grievances = await Grievance.find({
      priority: "Critical",
      status: { $nin: ["Resolved", "Closed"] },
    })
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email phone designation")
      .populate("department", "name code")
      .sort({ createdAt: -1 });
    res.json({ grievances });
  } catch (error) {
    res.status(500).json({ message: "Error fetching critical grievances", error: error.message });
  }
};

const updateEscalation = async (req, res) => {
  try {
    const {
      status,
      officialResponse,
      instructionsToOfficer,
      reassignOfficerId,
      revisedDeadline,
      priority,
    } = req.body;

    const escalation = await Escalation.findById(req.params.id)
      .populate({
        path: "grievance",
        populate: [
          { path: "assignedOfficer", select: "name email phone designation" },
          { path: "department", select: "name code" },
        ],
      });

    if (!escalation) {
      return res.status(404).json({ message: "Escalation not found" });
    }

    escalation.higherOfficial = req.user.userId;

    if (status && ["Open", "Under Review", "Action Taken", "Closed"].includes(status)) {
      escalation.status = status;
    }

    if (officialResponse !== undefined) {
      escalation.actionTaken = officialResponse;
    }

    // Direct instructions to officer
    if (instructionsToOfficer && instructionsToOfficer.trim()) {
      escalation.instructionsToOfficer = instructionsToOfficer.trim();
      const currentOfficerId = escalation.grievance.assignedOfficer?._id;
      if (currentOfficerId) {
        await notify(
          currentOfficerId,
          escalation.grievance,
          "HIGHER_OFFICIAL_INSTRUCTION",
          `Higher Official directive on ${escalation.grievance.grievanceId}: ${instructionsToOfficer.trim()}`
        );
      }
      await addHistory(
        escalation.grievance,
        "Higher Official Directive",
        req.user,
        `Instruction to officer: "${instructionsToOfficer.trim()}"`
      );
    }

    // Reassigning officer
    if (reassignOfficerId) {
      const newOfficer = await User.findOne({ _id: reassignOfficerId, role: "officer", isActive: true });
      if (newOfficer) {
        const oldOfficerName = escalation.grievance.assignedOfficer?.name || "Previous Officer";
        escalation.reassignedOfficer = newOfficer._id;
        escalation.grievance.assignedOfficer = newOfficer._id;

        await addHistory(
          escalation.grievance,
          "Officer Reassigned by Higher Official",
          req.user,
          `Reassigned from ${oldOfficerName} to ${newOfficer.name} (${newOfficer.designation || "Officer"}).`
        );

        await notify(
          newOfficer._id,
          escalation.grievance,
          "GRIEVANCE_REASSIGNED",
          `Higher Official reassigned escalated grievance ${escalation.grievance.grievanceId} to you.`
        );
      }
    }

    // Changing Priority
    if (priority && ["Low", "Medium", "High", "Critical"].includes(priority)) {
      const oldPriority = escalation.grievance.priority;
      escalation.priority = priority;
      escalation.grievance.priority = priority;
      await addHistory(
        escalation.grievance,
        "Priority Adjusted by Higher Official",
        req.user,
        `Priority revised from ${oldPriority} to ${priority}.`
      );
    }

    // Revising Deadline
    if (revisedDeadline) {
      const newDue = new Date(revisedDeadline);
      escalation.revisedDueDate = newDue;
      escalation.grievance.dueDate = newDue;

      if (newDue > new Date() && escalation.grievance.status === "Overdue") {
        escalation.grievance.status = "In Progress";
      }

      await addHistory(
        escalation.grievance,
        "Deadline Extended by Higher Official",
        req.user,
        `Resolution deadline revised to ${newDue.toLocaleDateString()}.`
      );
    }

    if (status === "Closed") {
      escalation.closedAt = new Date();
    }
    escalation.reviewedAt = new Date();

    await escalation.grievance.save();
    await escalation.save();

    await addHistory(
      escalation.grievance,
      status === "Closed" ? "Escalation Closed" : "Escalation Updated",
      req.user,
      officialResponse || `Status changed to ${escalation.status}`
    );

    await notify(
      escalation.citizen,
      escalation.grievance,
      "ESCALATION_UPDATED",
      `Higher Official intervention recorded for your grievance ${escalation.grievance.grievanceId}: status is now ${escalation.status}.`
    );

    res.json({
      message: "Escalation updated successfully",
      escalation,
    });
  } catch (error) {
    console.error("Update escalation error:", error);
    res.status(500).json({ message: "Error updating escalation", error: error.message });
  }
};

const updatePriority = async (req, res) => {
  req.body = { ...req.body, officialResponse: req.body.remark || "Priority updated by Higher Official" };
  const escalation = await Escalation.findOne({ grievance: req.params.id });
  if (!escalation) return res.status(404).json({ message: "Escalation not found for this grievance" });
  req.params.id = escalation._id;
  return updateEscalation(req, res);
};

module.exports = {
  dashboard,
  getEscalations,
  getEscalationById,
  getOfficersList,
  getOverdue,
  getCritical,
  updateEscalation,
  updatePriority,
};
