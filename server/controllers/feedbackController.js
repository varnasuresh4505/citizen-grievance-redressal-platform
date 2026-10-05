const Feedback = require("../models/Feedback");
const Grievance = require("../models/Grievance");
const { addHistory, notify } = require("../services/workflowService");

const createFeedback = async (req, res) => {
  const { grievanceId, rating, comment = "" } = req.body;
  if (!grievanceId || !Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: "A grievance and rating from 1 to 5 are required" });
  const grievance = await Grievance.findOne({ _id: grievanceId, citizen: req.user.userId });
  if (!grievance) return res.status(404).json({ message: "Grievance not found" });
  if (!["Resolved", "Closed"].includes(grievance.status)) return res.status(400).json({ message: "Feedback is available after resolution" });
  const existing = await Feedback.findOne({ grievance: grievance._id });
  if (existing) return res.status(409).json({ message: "Feedback has already been submitted for this grievance" });
  const feedback = await Feedback.create({ grievance: grievance._id, citizen: req.user.userId, rating, comment });
  grievance.feedback = { rating, comment, submittedAt: new Date() };
  await grievance.save();
  await addHistory(grievance, "Citizen Feedback Submitted", req.user, comment);
  await notify(grievance.assignedOfficer, grievance, "STATUS_CHANGED", `Citizen feedback was submitted for ${grievance.grievanceId}.`);
  res.status(201).json({ message: "Feedback submitted", feedback });
};
module.exports = { createFeedback };
