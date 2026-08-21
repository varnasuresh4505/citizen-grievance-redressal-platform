const Grievance = require("../models/Grievance");

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
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        message: "Title, description and location are required",
      });
    }

    const grievance = await Grievance.create({
      citizen: req.user.userId,
      title,
      description,
      category: category || "Other",
      location,
      priority: priority || "Medium",
    });

    res.status(201).json({
      message: "Grievance submitted successfully",
      grievance,
    });
  } catch (error) {
    console.error("Create grievance error:", error);

    res.status(500).json({
      message: "Server error while creating grievance",
    });
  }
};

// ======================================================
// GET MY GRIEVANCES
// ======================================================

const getMyGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({
      citizen: req.user.userId,
    })
      .populate("citizen", "name email phone")
      .sort({ createdAt: -1 });

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
      .populate("citizen", "name email phone")
      .populate("assignedOfficer", "name email phone");

    // Grievance doesn't exist
    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    // Citizen can only view their own grievance
    if (grievance.citizen._id.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to view this grievance",
      });
    }

    res.status(200).json({
      grievance,
    });
  } catch (error) {
    console.error("Get grievance details error:", error);

    res.status(500).json({
      message: "Server error while fetching grievance",
    });
  }
};

module.exports = {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
};