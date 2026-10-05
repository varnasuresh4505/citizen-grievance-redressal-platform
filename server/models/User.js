const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ======================================================
    // BASIC USER INFORMATION
    // ======================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // ADDITIONAL CITIZEN INFORMATION
    // ======================================================

    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "transgender",
        "prefer_not_to_say",
      ],
      default: "prefer_not_to_say",
    },

    differentlyAbled: {
      type: Boolean,
      default: false,
    },

    // ======================================================
    // USER ROLE
    // ======================================================

    role: {
      type: String,
      enum: [
        "citizen",
        "officer",
        "employee",
        "higher_official",
        "admin",
      ],
      default: "citizen",
    },

    // ======================================================
    // DEPARTMENT
    // Used by officers and employees
    // ======================================================

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    // ======================================================
    // OFFICER RELATIONSHIP
    //
    // For an employee:
    // officerId = officer who manages the employee
    //
    // For an officer:
    // officerId = null
    // ======================================================

    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    designation: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // ACCOUNT STATUS
    // ======================================================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.index({ role: 1 });
userSchema.index({ departmentId: 1 });
userSchema.index({ officerId: 1 });
userSchema.index({ phone: 1 });

module.exports = mongoose.model(
  "User",
  userSchema
);
