const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    // Citizen who submitted the grievance
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Short title of the grievance
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Detailed description
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Grievance category
    category: {
      type: String,
      enum: [
        "Water",
        "Electricity",
        "Road",
        "Sanitation",
        "Public Safety",
        "Transportation",
        "Other",
      ],
      default: "Other",
    },

    // Location where the problem occurred
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Priority of the grievance
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    // Current grievance status
    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "In Progress",
        "Resolved",
        "Closed",
        "Rejected",
      ],
      default: "Pending",
    },

    // Officer assigned to handle the grievance
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Resolution details provided by the officer
    resolution: {
      type: String,
      default: "",
      trim: true,
    },

    // Date when the grievance was resolved
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Grievance = mongoose.model("Grievance", grievanceSchema);

module.exports = Grievance;