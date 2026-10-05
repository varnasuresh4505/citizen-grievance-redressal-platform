const Location = require("../models/Location");

const parseWard = (value) => Number.parseInt(value, 10);
const getWards = async (req, res) => {
  const wards = await Location.find({ isActive: true }).select("wardNumber wardName boundaryDescription").sort({ wardNumber: 1 });
  res.json({ wards });
};
const getWard = async (req, res) => {
  const ward = await Location.findOne({ wardNumber: parseWard(req.params.wardNumber), isActive: true });
  if (!ward) return res.status(404).json({ message: "Verified ward not found" });
  res.json({ ward });
};
const getAreas = async (req, res) => {
  const ward = await Location.findOne({ wardNumber: parseWard(req.params.wardNumber), isActive: true }).select("areas");
  if (!ward) return res.status(404).json({ message: "Verified ward not found" });
  res.json({ areas: ward.areas.map((area) => ({ id: area._id, name: area.name })) });
};
const getStreets = async (req, res) => {
  const ward = await Location.findOne({ wardNumber: parseWard(req.params.wardNumber), isActive: true });
  if (!ward) return res.status(404).json({ message: "Verified ward not found" });
  const area = ward.areas.id(req.params.areaId);
  if (!area) return res.status(404).json({ message: "Verified area not found" });
  res.json({ streets: area.streets });
};
const upsertWard = async (req, res) => {
  const { wardNumber, wardName, areas = [], boundaryDescription = "", isActive = true } = req.body;
  if (!Number.isInteger(wardNumber) || wardNumber < 1 || wardNumber > 27 || !wardName) return res.status(400).json({ message: "A ward number from 1 to 27 and ward name are required" });
  const ward = await Location.findOneAndUpdate({ wardNumber }, { wardNumber, wardName, areas, boundaryDescription, isActive }, { new: true, upsert: true, runValidators: true });
  res.status(200).json({ message: "Location saved", ward });
};
const deleteWard = async (req, res) => {
  const ward = await Location.findOneAndDelete({ wardNumber: parseWard(req.params.wardNumber) });
  if (!ward) return res.status(404).json({ message: "Ward not found" });
  res.json({ message: "Location removed" });
};
module.exports = { getWards, getWard, getAreas, getStreets, upsertWard, deleteWard };
