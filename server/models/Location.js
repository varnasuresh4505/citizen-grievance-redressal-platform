const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  streets: [{ type: String, trim: true }],
}, { _id: true });

const locationSchema = new mongoose.Schema({
  wardNumber: { type: Number, required: true, min: 1, max: 27, unique: true },
  wardName: { type: String, required: true, trim: true },
  areas: { type: [areaSchema], default: [] },
  boundaryDescription: { type: String, default: "", trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Location", locationSchema);
