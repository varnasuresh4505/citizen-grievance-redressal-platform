const Escalation = require("../models/Escalation");
const Grievance = require("../models/Grievance");
const User = require("../models/User");
const { addHistory, notify } = require("../services/workflowService");

const createEscalation = async (req, res) => {
  try {
    const { grievanceId, reason, additionalInfo = "", evidence = [] } = req.body;
    if (!grievanceId || !reason?.trim()) {
      return res.status(400).json({ message: "Grievance ID and escalation reason are required" });
    }

    const grievance = await Grievance.findOne({ _id: grievanceId, citizen: req.user.userId })
      .populate("assignedOfficer", "name email phone designation")
      .populate("department", "name code");

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found or not owned by you" });
    }

    // Dynamic overdue verification
    const now = new Date();
    const isPastDue = grievance.dueDate && now > new Date(grievance.dueDate);
    const isUnresolved = !["Resolved", "Closed", "Rejected"].includes(grievance.status);

    if (!isPastDue && grievance.status !== "Overdue") {
      return res.status(400).json({ message: "Only overdue grievances whose deadline has passed can be escalated" });
    }

    if (!isUnresolved) {
      return res.status(400).json({ message: `Cannot escalate a grievance that is already ${grievance.status}` });
    }

    if (grievance.status !== "Overdue") {
      grievance.status = "Overdue";
      await grievance.save();
    }

    const existingEscalation = await Escalation.findOne({ grievance: grievance._id });
    if (existingEscalation) {
      return res.status(409).json({ message: "This grievance is already escalated to the Higher Official" });
    }

    const daysOverdue = grievance.dueDate
      ? Math.max(1, Math.ceil((now - new Date(grievance.dueDate)) / (1000 * 60 * 60 * 24)))
      : 1;

    const evidenceArray = Array.isArray(evidence) ? evidence : (evidence ? [evidence] : []);

    const escalation = await Escalation.create({
      grievance: grievance._id,
      citizen: req.user.userId,
      reason: reason.trim(),
      additionalInfo: additionalInfo.trim(),
      evidence: evidenceArray,
      daysOverdueAtEscalation: daysOverdue,
      status: "Open",
    });

    await addHistory(
      grievance,
      "Escalated to Higher Official",
      req.user,
      `Citizen escalated due to delay (${daysOverdue} days overdue). Reason: ${reason.trim()}`
    );

    const higherOfficials = await User.find({ role: "higher_official", isActive: true }).select("_id");
    await Promise.all(
      higherOfficials.map((official) =>
        notify(
          official._id,
          grievance,
          "ESCALATION_CREATED",
          `Grievance ${grievance.grievanceId} is overdue by ${daysOverdue} days and has been escalated by citizen.`
        )
      )
    );

    if (grievance.assignedOfficer) {
      await notify(
        grievance.assignedOfficer._id,
        grievance,
        "ESCALATION_ALERT",
        `Grievance ${grievance.grievanceId} assigned to you has been escalated to Higher Official due to deadline delay.`
      );
    }

    res.status(201).json({
      message: "Grievance escalated to Higher Official successfully",
      escalation,
    });
  } catch (error) {
    console.error("Create escalation error:", error);
    res.status(500).json({ message: "Server error while creating escalation", error: error.message });
  }
};

module.exports = { createEscalation };
