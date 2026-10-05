const express = require("express");
const Department = require("../models/Department");

const router = express.Router();

// GET /api/departments - list active departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments", error: error.message });
  }
});

module.exports = router;
