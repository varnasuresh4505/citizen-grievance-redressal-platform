require("dotenv").config();
const mongoose = require("mongoose");
const Location = require("../models/Location");

// Tamil Nadu Government Gazette No. 407 (December 2018), Sathyamangalam Municipality.
// These are delimitation references, not a claim that every reference is wholly inside a ward.
const wards = [
  [1, ["Reserved Forest", "Bhavani River", "Kottuveerampalayam Rural Road", "Nadar Colony", "Chikkarasampalayam Village"]],
  [2, ["Reserved Forest", "Thippusulthan Main Road", "Periyakulam", "Kottuveerampalayam Rural Road", "Bakkiyalakshmi Nagar"]],
  [3, ["Reserved Forest", "Thippusulthan Main Road", "Bathirakaliyamman Kovil East Street", "Varadhampalayam Rural Road", "Madeswarappan Kovil Road", "Periyakulam Road"]],
  [4, ["Sathyamangalam Rural boundary", "Bathirakaliyamman Kovil East Street", "Dhandumariyamman West Street", "Suseendharan Layout"]],
  [5, ["Reserved Forest", "Forest Depot North Street", "Puliyangombai Road", "Madeshwarappan Kovil Road"]],
  [6, ["Forest Depot North Street", "Telephone Exchange Office", "Thandumariyamman Kovil Streets"]],
  [7, ["Forest Depot North Street", "Telephone Exchange Office", "Thandumariyamman Kovil Streets"]],
  [8, ["Forest Depot North Street", "R.C. Church", "Thiruneelakandar Mandapam Street"]],
  [9, ["Puliyankombai Road", "Weekly Market", "Annaiyan East Street", "Agricultural land"]],
  [10, ["Puliyankombai Road", "Weekly Market", "Annaiyan East Street"]],
  [11, ["Government Boys Higher Secondary School", "Athani Road", "Bhavani River", "Malaiyadipudur Village", "Kongu Nagar"]],
  [12, ["Thippusulthan Road", "Municipal Elementary School", "R.C. Church", "Athani Road", "North Pet Road"]],
  [13, ["Thippusulthan Road", "Vengatachalam Big Street", "North Pet Road", "Bathirakaliyamman Kovil West Street"]],
  [14, ["Bathirakaliyamman East Street", "Mariyamman Kovil Street", "North Pet Road", "Bathirakaliyamman Kovil West Street"]],
  [15, ["Vengatachalam Small Street", "Bazaar Street", "North Pet Road", "Bathirakaliyamman Kovil New Street"]],
  [16, ["Thippusulathan Road", "Bazaar Street", "Bathirakaliyamman Kovil Street", "Soundamman Kovil Street"]],
  [17, ["Bakkiayalakshmi Nagar", "Bathirakaliyamman Kovil New/West Streets", "Soundamman Kovil Street"]],
  [18, ["Thippusulathan Road", "Bazaar Street", "Old Post Office Road", "Iyyappan Nagar"]],
  [19, ["Sowdamman Kovil Street", "Bhavani River", "Old Post Office South Street", "Kottuveerampalayam Rural"]],
  [20, ["Bazaar Street", "Bhavani River", "Meenachi Amman Kovil West Street", "Muniyappan Kovil Street"]],
  [21, ["Bazaar Street", "Bhavani River", "Old Post Office South Street", "Mathimarathurai Street"]],
  [22, ["Sunnambukara Lane", "Bhavani River", "Cutchery Street", "Pillaiyar Kovil Street"]],
  [23, ["Bhavani River", "Ariyappampalayam Village municipal boundary", "Thelkaradu Streets", "Rangasamuthiram lanes"]],
  [24, ["Bhavani River", "Mysore Trunk Road", "Anna Nagar/Thelkaradu Colony", "Govindarajapuram Harijan Colony"]],
  [25, ["Bhavani River", "Mysore Trunk Road", "Thelkaradu Colony", "Koothanur Road"]],
  [26, ["Bhavani River", "Mettupalayam Road", "Parisal Thurai Street", "Konamoolai Village"]],
  [27, ["Mettupalayam Road", "Panchayat Union Office", "Ariyappampalayam Village boundary", "Konamoolai Village", "Thirunagar Colony", "Gobi Main Road", "Mysore Trunk Road"]],
].map(([wardNumber, areas]) => ({ wardNumber, wardName: `Ward ${wardNumber}`, areas }));

function validateWards() {
  const wardNumbers = wards.map((ward) => ward.wardNumber);
  if (wards.length !== 27 || new Set(wardNumbers).size !== 27 || wardNumbers.some((number) => number < 1 || number > 27)) {
    throw new Error("Ward seed data must contain each Sathyamangalam ward exactly once (1-27).");
  }
  if (wards.some((ward) => !ward.areas.length || new Set(ward.areas).size !== ward.areas.length)) {
    throw new Error("Each ward must have non-duplicate official delimitation references.");
  }
}

async function seedWards() {
  validateWards();
  await mongoose.connect(process.env.MONGO_URI);
  await Location.bulkWrite(wards.map((ward) => {
    const boundaryDescription = `Official delimitation boundary/location references: ${ward.areas.join("; ")}`;
    return { updateOne: { filter: { wardNumber: ward.wardNumber }, update: { $set: { ...ward, areas: ward.areas.map((name) => ({ name, streets: [] })), boundaryDescription, isActive: true } }, upsert: true } };
  }));
  console.log("Seeded 27 official ward boundary/location references.");
  await mongoose.disconnect();
}
seedWards().catch((error) => { console.error(error); process.exit(1); });
