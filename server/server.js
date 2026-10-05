const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const grievanceRoutes = require("./routes/grievanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const officerRoutes = require("./routes/officerRoutes");
const taskRoutes = require("./routes/taskRoutes");
const locationRoutes = require("./routes/locationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const escalationRoutes = require("./routes/escalationRoutes");
const higherOfficialRoutes = require("./routes/higherOfficialRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const { checkOverdueGrievances } = require("./services/workflowService");

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors({
  origin: "http://localhost:5173",
}));

// Evidence images are stored as data URLs by the current academic-project setup.
// This accommodates up to three 2 MB images plus the rest of a grievance payload.
app.use(express.json({ limit: "8mb" }));

// ======================================================
// ROUTES
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/test", testRoutes);
app.use("/api/grievances", grievanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/escalations", escalationRoutes);
app.use("/api/higher-official", higherOfficialRoutes);
app.use("/api/feedback", feedbackRoutes);

// ======================================================
// BASIC TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "Citizen Grievance Redressal API is running",
  });
});

// ======================================================
// DATABASE CONNECTION
// ======================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
    checkOverdueGrievances().catch((error) => console.error("Initial overdue check failed:", error.message));
    setInterval(() => checkOverdueGrievances().catch((error) => console.error("Overdue check failed:", error.message)), 60 * 60 * 1000);
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
