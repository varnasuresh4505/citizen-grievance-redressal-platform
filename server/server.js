const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const grievanceRoutes = require("./routes/grievanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const officerRoutes = require("./routes/officerRoutes");

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

// ======================================================
// ROUTES
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/grievances", grievanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/officer", officerRoutes);

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
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });