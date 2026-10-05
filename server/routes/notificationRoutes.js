const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const c = require("../controllers/notificationController");
router.get("/", protect, c.getNotifications);
router.patch("/:id/read", protect, c.markRead);
module.exports = router;
