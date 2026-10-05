const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // ======================================================
    // GRIEVANCE
    // ======================================================

    grievance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grievance",
      required: true,
    },

    // ======================================================
    // EMPLOYEE WHO RECEIVES THE TASK
    // ======================================================

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ======================================================
    // OFFICER WHO ASSIGNED THE TASK
    // ======================================================

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ======================================================
    // TASK DETAILS
    // ======================================================

    taskDescription: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // TASK STATUS
    // ======================================================

    status: {
      type: String,
      enum: [
        "Assigned",
        "Accepted",
        "In Progress",
        "On Hold",
        "Completed",
      ],
      default: "Assigned",
    },

    // ======================================================
    // EMPLOYEE REMARKS
    // ======================================================

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // EVIDENCE / WORK PROOF
    // ======================================================

    evidence: {
      type: [String],
      default: [],
    },

    deadline: {
      type: Date,
      default: null,
    },

    // ======================================================
    // DATES
    // ======================================================

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ grievance: 1 });
taskSchema.index({ employee: 1 });
taskSchema.index({ status: 1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
