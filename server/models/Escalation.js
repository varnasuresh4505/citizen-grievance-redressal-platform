const mongoose = require("mongoose");

const escalationSchema = new mongoose.Schema(
  {
    // ======================================================
    // GRIEVANCE BEING ESCALATED
    // ======================================================

    grievance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grievance",
      required: true,
    },

    // ======================================================
    // CITIZEN WHO REQUESTED ESCALATION
    // ======================================================

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ======================================================
    // REASON FOR ESCALATION
    // ======================================================

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    additionalInfo: {
      type: String,
      default: "",
      trim: true,
    },

    evidence: {
      type: [String],
      default: [],
    },

    daysOverdueAtEscalation: {
      type: Number,
      default: 0,
    },

    // ======================================================
    // HIGHER OFFICIAL
    // ======================================================

    higherOfficial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ======================================================
    // ESCALATION STATUS
    // ======================================================

    status: {
      type: String,
      enum: [
        "Open",
        "Under Review",
        "Action Taken",
        "Closed",
        "Rejected",
      ],
      default: "Open",
    },

    // ======================================================
    // ACTION TAKEN BY HIGHER OFFICIAL
    // ======================================================

    actionTaken: {
      type: String,
      default: "",
      trim: true,
    },

    instructionsToOfficer: {
      type: String,
      default: "",
      trim: true,
    },

    reassignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ======================================================
    // REVISED DEADLINE
    // ======================================================

    revisedDueDate: {
      type: Date,
      default: null,
    },

    // ======================================================
    // PRIORITY AFTER ESCALATION
    // ======================================================

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "High",
    },

    // ======================================================
    // DATES
    // ======================================================

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

escalationSchema.index({ grievance: 1, unique: true });
escalationSchema.index({ status: 1 });

const Escalation = mongoose.model("Escalation", escalationSchema);

module.exports = Escalation;
