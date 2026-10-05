const mongoose = require("mongoose");

const grievanceHistorySchema = new mongoose.Schema({
  grievance: { type: mongoose.Schema.Types.ObjectId, ref: "Grievance", required: true, index: true },
  action: { type: String, required: true, trim: true },
  status: { type: String, default: "", trim: true },
  remark: { type: String, default: "", trim: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  actorRole: { type: String, default: "system", trim: true },
}, { timestamps: true });

module.exports = mongoose.model("GrievanceHistory", grievanceHistorySchema);
