const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Protected route - any logged-in user
router.get("/protected", protect, (req, res) => {
  res.status(200).json({
    message: "You accessed a protected route successfully",
    user: req.user,
  });
});

// Officer-only route
router.get(
  "/officer-only",
  protect,
  authorize("officer"),
  (req, res) => {
    res.status(200).json({
      message: "You accessed an officer-only route successfully",
      user: req.user,
    });
  }
);

module.exports = router;