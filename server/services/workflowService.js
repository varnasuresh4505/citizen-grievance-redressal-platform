const Grievance = require("../models/Grievance");
const GrievanceHistory = require("../models/GrievanceHistory");
const Notification = require("../models/Notification");

const addHistory = (grievance, action, actor, remark = "") => GrievanceHistory.create({
  grievance: grievance._id || grievance,
  action,
  status: grievance.status || "",
  remark,
  updatedBy: actor?.userId || actor?._id || null,
  actorRole: actor?.role || "system",
});

const notify = (user, grievance, type, message) => {
  if (!user) return null;
  return Notification.create({ user, grievance: grievance?._id || grievance || null, type, message });
};

const checkOverdueGrievances = async () => {
  const overdue = await Grievance.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ["Resolved", "Closed", "Rejected", "Overdue"] },
  });
  await Promise.all(overdue.map(async (grievance) => {
    grievance.status = "Overdue";
    await grievance.save();
    await addHistory(grievance, "Grievance Overdue", null, "The resolution deadline has passed.");
    await notify(grievance.citizen, grievance, "STATUS_CHANGED", `Your grievance ${grievance.grievanceId} is overdue.`);
    await notify(grievance.assignedOfficer, grievance, "STATUS_CHANGED", `Grievance ${grievance.grievanceId} is overdue.`);
  }));
  return overdue.length;
};

module.exports = { addHistory, notify, checkOverdueGrievances };
