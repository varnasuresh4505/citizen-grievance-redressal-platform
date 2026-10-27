const crypto = require("crypto");

const Grievance = require("../models/Grievance");
const Department = require("../models/Department");
const Location = require("../models/Location");
const GrievanceHistory = require("../models/GrievanceHistory");
const { addHistory, notify } = require("../services/workflowService");
const { analyzeGrievanceWithAI } = require("../services/aiAnalysisService");

// ======================================================
// RESOLUTION TIME CONFIGURATION
// ======================================================

const resolutionDays = {
  Low: 15,
  Medium: 10,
  High: 7,
  Critical: 3,
};

// ======================================================
// GENERATE UNIQUE GRIEVANCE ID
// Example: GRV-SLM-2026-A1B2C3
// ======================================================

const generateGrievanceId = async () => {
  const year = new Date().getFullYear();
  const prefix = `GRV-SLM-${year}-`;
  
  // Find all grievances matching the current year prefix
  const existing = await Grievance.find({ grievanceId: new RegExp(`^${prefix}\\d+$`) })
    .select("grievanceId")
    .lean();

  let maxSeq = 0;
  for (const item of existing) {
    if (item.grievanceId && item.grievanceId.startsWith(prefix)) {
      const seqStr = item.grievanceId.slice(prefix.length);
      const seqNum = Number.parseInt(seqStr, 10);
      // Exclude artificial test sequences (>= 90000) from jumping regular citizen docket IDs
      if (!Number.isNaN(seqNum) && seqNum < 90000 && seqNum > maxSeq) {
        maxSeq = seqNum;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidateId = `${prefix}${String(nextSeq).padStart(5, "0")}`;

  // Guaranteed uniqueness: increment if candidate already exists
  while (await Grievance.exists({ grievanceId: candidateId })) {
    nextSeq++;
    candidateId = `${prefix}${String(nextSeq).padStart(5, "0")}`;
  }

  return candidateId;
};

// ======================================================
// CREATE GRIEVANCE
// ======================================================

const createGrievance = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      priority,
      department,
      evidence,
    } = req.body;

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------

    if (!title || !description || !location) {
      return res.status(400).json({
        message: "Title, description and location are required",
      });
    }

    const {
      wardNumber,
      village = "Sathyamangalam",
      area = "",
      landmark = "",
      address = "",
      street = "",
    } = location;

    if (!wardNumber || (!address && !landmark)) {
      return res.status(400).json({
        message: "Ward number and address or landmark are required",
      });
    }

    const parsedWardNumber = Number(wardNumber);
    if (parsedWardNumber < 1 || parsedWardNumber > 27) {
      return res.status(400).json({
        message: "Invalid ward number. Sathyamangalam has 27 wards.",
      });
    }

    const verifiedWard = await Location.findOne({ wardNumber: parsedWardNumber, isActive: true });
    const wardName = verifiedWard ? verifiedWard.wardName : `Ward ${parsedWardNumber}`;

    // --------------------------------------------------
    // DEPARTMENT IDENTIFICATION & AUTO-ASSIGNMENT
    // --------------------------------------------------

    let departmentDoc = null;
    const User = require("../models/User");

    if (department) {
      if (department.match(/^[0-9a-fA-F]{24}$/)) {
        departmentDoc = await Department.findById(department);
      } else {
        departmentDoc = await Department.findOne({
          $or: [{ name: department }, { code: department.toUpperCase() }],
          isActive: true,
        });
      }
    }

    if (!departmentDoc && category) {
      departmentDoc = await Department.findOne({
        name: category,
        isActive: true,
      });
    }

    if (!departmentDoc) {
      departmentDoc = await Department.findOne({ code: "OTHER" }) || await Department.findOne({ isActive: true });
    }

    // Auto-assign to an active officer of this department
    let assignedOfficerId = null;
    if (departmentDoc) {
      const officer = await User.findOne({
        role: "officer",
        departmentId: departmentDoc._id,
        isActive: true,
      });
      if (officer) {
        assignedOfficerId = officer._id;
      }
    }

    // --------------------------------------------------
    // AI ADVISORY ANALYSIS & AUTOMATED PRIORITY DETECTION
    // Note: Citizen-supplied priority is ignored for integrity.
    // --------------------------------------------------

    let aiAnalysis;
    try {
      aiAnalysis = await analyzeGrievanceWithAI({
        title,
        description,
        category: departmentDoc ? departmentDoc.name : category,
        location: {
          wardNumber: parsedWardNumber,
          wardName,
          village,
          landmark,
          address,
        },
      });
    } catch (_) {
      aiAnalysis = {
        priority: "Medium",
        summary: "Automated AI briefing summary unavailable. Please review original citizen complaint.",
        processingStatus: "failed",
        confidence: 0,
      };
    }

    // Assign priority from AI classification (safe fallback: Medium)
    const detectedPriority = aiAnalysis.priority && resolutionDays[aiAnalysis.priority]
      ? aiAnalysis.priority
      : "Medium";

    const allowedDays = resolutionDays[detectedPriority] || 10;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + allowedDays);

    const grievance = await Grievance.create({
      citizen: req.user.userId,
      grievanceId: await generateGrievanceId(),
      title: title.trim(),
      description: description.trim(),
      category: departmentDoc ? departmentDoc.name : (category || "Other Government Services"),
      location: {
        wardNumber: parsedWardNumber,
        wardName,
        village: village.trim(),
        area: (area || landmark || "Sathyamangalam").trim(),
        street: street ? street.trim() : "",
        address: (address || landmark).trim(),
        landmark: landmark ? landmark.trim() : "",
      },
      priority: detectedPriority,
      department: departmentDoc ? departmentDoc._id : null,
      assignedOfficer: assignedOfficerId,
      status: assignedOfficerId ? "Assigned" : "Submitted",
      allowedResolutionDays: allowedDays,
      dueDate,
      evidence: Array.isArray(evidence) ? evidence : [],
      aiAnalysis: {
        category: departmentDoc ? departmentDoc.name : (category || ""),
        severity: detectedPriority,
        confidence: aiAnalysis.confidence || 0,
        keywords: aiAnalysis.keywords || [],
        summary: aiAnalysis.summary || "",
        processingStatus: aiAnalysis.processingStatus || "unconfigured",
      },
    });

    await grievance.populate("department", "name code description");
    if (assignedOfficerId) {
      await grievance.populate("assignedOfficer", "name email phone designation");
    }

    await addHistory(grievance, "Grievance Submitted", req.user, `Citizen submitted grievance. Expected resolution within ${allowedDays} days.`);
    if (assignedOfficerId) {
      await addHistory(grievance, "Officer Assigned", null, `Automatically assigned to ${grievance.assignedOfficer?.name || "department officer"}.`);
      await notify(assignedOfficerId, grievance, "GRIEVANCE_ASSIGNED", `New grievance ${grievance.grievanceId} assigned to your department.`);
    }

    res.status(201).json({
      message: "Grievance submitted successfully",
      grievance,
    });
  } catch (error) {
    console.error("Create grievance error:", error);
    res.status(500).json({
      message: "Server error while creating grievance: " + error.message,
    });
  }
};

// ======================================================
// GET MY GRIEVANCES
// ======================================================

const getMyGrievances = async (req, res) => {
  try {
    const rawGrievances = await Grievance.find({
      citizen: req.user.userId,
    })
      .populate("citizen", "name email phone address gender differentlyAbled")
      .populate("assignedOfficer", "name email phone designation")
      .populate("department", "name code description")
      .sort({ createdAt: -1 });

    const now = new Date();
    const Escalation = require("../models/Escalation");

    const grievances = await Promise.all(
      rawGrievances.map(async (g) => {
        const isPastDue = g.dueDate && now > new Date(g.dueDate);
        const isUnresolved = !["Resolved", "Closed", "Rejected"].includes(g.status);

        if (isPastDue && isUnresolved && g.status !== "Overdue") {
          g.status = "Overdue";
          await g.save();
        }

        const overdueDays = (isPastDue && isUnresolved)
          ? Math.max(1, Math.ceil((now - new Date(g.dueDate)) / (1000 * 60 * 60 * 24)))
          : 0;

        const escalation = await Escalation.findOne({ grievance: g._id })
          .populate("higherOfficial", "name email")
          .lean();

        const plain = g.toObject();
        plain.isOverdue = isPastDue && isUnresolved;
        plain.overdueDays = overdueDays;
        plain.escalation = escalation || null;
        return plain;
      })
    );

    res.status(200).json({
      count: grievances.length,
      grievances,
    });
  } catch (error) {
    console.error("Get grievances error:", error);
    res.status(500).json({
      message: "Server error while fetching grievances",
    });
  }
};

// ======================================================
// GET SINGLE GRIEVANCE
// Citizen can view only their own grievance
// ======================================================

const getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate("citizen", "name email phone address gender differentlyAbled")
      .populate("assignedOfficer", "name email phone designation")
      .populate("department", "name code description");

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    if (grievance.citizen._id.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to view this grievance",
      });
    }

    const now = new Date();
    const isPastDue = grievance.dueDate && now > new Date(grievance.dueDate);
    const isUnresolved = !["Resolved", "Closed", "Rejected"].includes(grievance.status);

    if (isPastDue && isUnresolved && grievance.status !== "Overdue") {
      grievance.status = "Overdue";
      await grievance.save();
    }

    const overdueDays = (isPastDue && isUnresolved)
      ? Math.max(1, Math.ceil((now - new Date(grievance.dueDate)) / (1000 * 60 * 60 * 24)))
      : 0;

    const Escalation = require("../models/Escalation");
    const escalation = await Escalation.findOne({ grievance: grievance._id })
      .populate("higherOfficial", "name email")
      .lean();

    const history = await GrievanceHistory.find({ grievance: grievance._id })
      .populate("updatedBy", "name role designation")
      .sort({ createdAt: 1 });

    const plain = grievance.toObject();
    plain.isOverdue = isPastDue && isUnresolved;
    plain.overdueDays = overdueDays;
    plain.escalation = escalation || null;

    res.status(200).json({
      grievance: plain,
      history,
    });
  } catch (error) {
    console.error("Get grievance details error:", error);
    res.status(500).json({
      message: "Server error while fetching grievance",
    });
  }
};

// ======================================================
// SUBMIT CITIZEN FEEDBACK
// ======================================================

const submitFeedback = async (req, res) => {
  try {
    const {
      rating,
      resolved,
      comment,
    } = req.body;

    // --------------------------------------------------
    // VALIDATE RATING
    // --------------------------------------------------

    if (
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        message:
          "Rating must be between 1 and 5",
      });
    }

    // --------------------------------------------------
    // VALIDATE RESOLUTION RESPONSE
    // --------------------------------------------------

    if (
      !["Yes", "Partially", "No"].includes(
        resolved
      )
    ) {
      return res.status(400).json({
        message:
          "Please select whether the issue was resolved",
      });
    }

    const grievance =
      await Grievance.findById(
        req.params.id
      );

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    // --------------------------------------------------
    // CITIZEN AUTHORIZATION
    // --------------------------------------------------

    if (
      grievance.citizen.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to submit feedback",
      });
    }

    // --------------------------------------------------
    // FEEDBACK ONLY AFTER RESOLUTION
    // --------------------------------------------------

    if (grievance.status !== "Resolved") {
      return res.status(400).json({
        message:
          "Feedback can only be submitted after the grievance is resolved",
      });
    }

    // --------------------------------------------------
    // PREVENT DUPLICATE FEEDBACK
    // --------------------------------------------------

    if (
      grievance.feedback &&
      grievance.feedback.submittedAt
    ) {
      return res.status(400).json({
        message:
          "Feedback has already been submitted",
      });
    }

    grievance.feedback = {
      rating,
      resolved,
      comment: comment
        ? comment.trim()
        : "",
      submittedAt: new Date(),
    };

    await grievance.save();

    res.status(200).json({
      message:
        "Feedback submitted successfully",
      grievance,
    });
  } catch (error) {
    console.error(
      "Submit feedback error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while submitting feedback",
    });
  }
};

// ======================================================
// REQUEST REOPEN / APPEAL
// ======================================================

const requestReopen = async (req, res) => {
  try {
    const {
      reason,
      additionalInfo,
    } = req.body;

    // --------------------------------------------------
    // VALIDATE REASON
    // --------------------------------------------------

    if (
      !reason ||
      !reason.trim()
    ) {
      return res.status(400).json({
        message:
          "Reopening reason is required",
      });
    }

    const grievance =
      await Grievance.findById(
        req.params.id
      );

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    // --------------------------------------------------
    // CITIZEN AUTHORIZATION
    // --------------------------------------------------

    if (
      grievance.citizen.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to reopen this grievance",
      });
    }

    // --------------------------------------------------
    // ONLY RESOLVED GRIEVANCES CAN BE REOPENED
    // --------------------------------------------------

    if (grievance.status !== "Resolved") {
      return res.status(400).json({
        message:
          "Only resolved grievances can be reopened",
      });
    }

    // --------------------------------------------------
    // PREVENT MULTIPLE PENDING REQUESTS
    // --------------------------------------------------

    if (
      grievance.reopenRequest?.status ===
      "Pending"
    ) {
      return res.status(400).json({
        message:
          "A reopening request is already under review",
      });
    }

    grievance.reopenRequest = {
      requested: true,

      reason: reason.trim(),

      additionalInfo:
        additionalInfo
          ? additionalInfo.trim()
          : "",

      status: "Pending",

      requestedAt: new Date(),

      reviewedAt: null,

      adminResponse: "",
    };

    await grievance.save();

    res.status(200).json({
      message:
        "Reopening request submitted successfully",
      grievance,
    });
  } catch (error) {
    console.error(
      "Request reopen error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while requesting reopening",
    });
  }
};

// ======================================================
// EXPORT FUNCTIONS
// ======================================================

module.exports = {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  submitFeedback,
  requestReopen,
};
