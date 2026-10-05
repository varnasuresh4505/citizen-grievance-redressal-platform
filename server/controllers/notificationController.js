const Notification = require("../models/Notification");
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user.userId }).populate("grievance", "grievanceId title status").sort({ createdAt: -1 });
  res.json({ count: notifications.length, notifications });
};
const markRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, { isRead: true }, { new: true });
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json({ notification });
};
module.exports = { getNotifications, markRead };
