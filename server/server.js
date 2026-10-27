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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. curl, health checks, server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

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
// HEALTH CHECK & BASIC TEST ROUTES
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "Citizen Grievance Redressal API is running",
    service: "civicresolve-api",
    status: "active",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// PORT BINDING & DATABASE CONNECTION
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

if (!process.env.MONGO_URI) {
  console.error("WARNING: MONGO_URI is not set in environment variables!");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected successfully");
      checkOverdueGrievances().catch((error) =>
        console.error("Initial overdue check failed:", error.message)
      );
      setInterval(
        () =>
          checkOverdueGrievances().catch((error) =>
            console.error("Overdue check failed:", error.message)
          ),
        60 * 60 * 1000
      );
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });
}
