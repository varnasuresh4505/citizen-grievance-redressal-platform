const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    // ======================================================
    // CITIZEN
    // ======================================================

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ======================================================
    // GRIEVANCE ID
    // ======================================================

    grievanceId: {
      type: String,
      unique: true,
      required: true,
    },

    // ======================================================
    // BASIC DETAILS
    // ======================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // CATEGORY
    // ======================================================

    category: {
      type: String,
      default: "Other Government Services",
      trim: true,
    },

    // ======================================================
    // LOCATION
    // ======================================================

    location: {
      wardNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 27,
      },

      wardName: {
        type: String,
        default: "",
        trim: true,
      },

      village: {
        type: String,
        default: "Sathyamangalam",
        trim: true,
      },

      area: {
        type: String,
        default: "",
        trim: true,
      },

      street: {
        type: String,
        default: "",
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      landmark: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ======================================================
    // AI ANALYSIS
    // ======================================================

    aiAnalysis: {
      category: {
        type: String,
        default: "",
      },

      severity: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical", null],
        default: null,
      },

      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: null,
      },

      keywords: {
        type: [String],
        default: [],
      },

      subcategory: { type: String, default: "", trim: true },
      recommendedDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
      summary: { type: String, default: "", trim: true },
      processingStatus: { type: String, enum: ["pending", "completed", "failed", "not_requested"], default: "not_requested" },
    },

    // ======================================================
    // PRIORITY
    // ======================================================

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    // ======================================================
    // DEPARTMENT
    // ======================================================

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    // ======================================================
    // ASSIGNED OFFICER
    // ======================================================

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ======================================================
    // GRIEVANCE STATUS
    // ======================================================

    status: {
      type: String,
      enum: [
        "Submitted",
        "Assigned",
        "Under Review",
        "In Progress",
        "On Hold",
        "Resolved",
        "Closed",
        "Rejected",
        "Reopened",
        "Overdue",
      ],
      default: "Submitted",
    },

    onHoldReason: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // DEADLINE
    // ======================================================

    allowedResolutionDays: {
      type: Number,
      default: 10,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    // ======================================================
    // RESOLUTION
    // ======================================================

    resolution: {
      type: String,
      default: "",
      trim: true,
    },

    resolutionProof: { type: [String], default: [] },
    closedAt: { type: Date, default: null },

    resolvedAt: {
      type: Date,
      default: null,
    },

    // ======================================================
    // SUPPORTING EVIDENCE
    // ======================================================

    evidence: {
      type: [String],
      default: [],
    },

    // ======================================================
    // CITIZEN FEEDBACK
    // ======================================================

    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },

      resolved: {
        type: String,
        enum: ["Yes", "Partially", "No", null],
        default: null,
      },

      comment: {
        type: String,
        default: "",
        trim: true,
      },

      submittedAt: {
        type: Date,
        default: null,
      },
    },

    // ======================================================
    // REOPEN / APPEAL
    // ======================================================

    reopenRequest: {
      requested: {
        type: Boolean,
        default: false,
      },

      reason: {
        type: String,
        default: "",
        trim: true,
      },

      additionalInfo: {
        type: String,
        default: "",
        trim: true,
      },

      status: {
        type: String,
        enum: ["None", "Pending", "Approved", "Rejected"],
        default: "None",
      },

      requestedAt: {
        type: Date,
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      adminResponse: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

grievanceSchema.index({ citizen: 1 });
grievanceSchema.index({ department: 1 });
grievanceSchema.index({ assignedOfficer: 1 });
grievanceSchema.index({ status: 1 });
grievanceSchema.index({ priority: 1 });
grievanceSchema.index({ "location.wardNumber": 1 });

const Grievance = mongoose.model("Grievance", grievanceSchema);

module.exports = Grievance;
