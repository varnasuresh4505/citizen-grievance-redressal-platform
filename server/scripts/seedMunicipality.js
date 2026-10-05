require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Department = require("../models/Department");
const User = require("../models/User");

// Official 16 Departments for Sathyamangalam Citizen Grievance Redressal
const departments = [
  ["Agriculture and Farmers Welfare", "AGRI"],
  ["Food and Civil Supplies", "FOOD"],
  ["Water Supply and Water Resources", "WATER"],
  ["Electricity and Power Services", "ELECTRIC"],
  ["Roads and Transport", "ROADS"],
  ["Public Health and Medical Services", "HEALTH"],
  ["Rural Development and Panchayat Services", "RURAL"],
  ["School and Higher Education", "EDU"],
  ["Social Welfare and Women Empowerment", "WOMEN"],
  ["Child Welfare and Protection", "CHILD"],
  ["Environment and Natural Resources", "ENV"],
  ["Tourism and Cultural Development", "TOUR"],
  ["Sanitation and Waste Management", "SANIT"],
  ["Animal Husbandry and Veterinary Services", "ANIMAL"],
  ["Employment and Skill Development", "EMPLOY"],
  ["Other Government Services", "OTHER"],
];

async function upsertUser(data) {
  return User.findOneAndUpdate(
    { email: data.email },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  );
}

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI);
  const password = await bcrypt.hash(process.env.SEED_PASSWORD || "ChangeMe@123", 10);

  let officerCount = 0;
  let employeeCount = 0;

  const activeCodes = departments.map((d) => d[1]);
  await Department.updateMany({ code: { $nin: activeCodes } }, { $set: { isActive: false } });

  for (const [name, code] of departments) {
    const department = await Department.findOneAndUpdate(
      { code },
      {
        $set: {
          name,
          code,
          description: `${name} services for Sathyamangalam area, Erode District`,
          isActive: true,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    const officers = [];
    for (let officerNumber = 1; officerNumber <= 2; officerNumber += 1) {
      const suffix = `${code.toLowerCase()}-officer-${officerNumber}`;
      const officer = await upsertUser({
        name: `${name} Officer ${officerNumber}`,
        email: `${suffix}@sathyamangalam.gov.in`,
        phone: `9000${code.padStart(4, "0").slice(0, 4)}${officerNumber}`.slice(0, 10),
        password,
        role: "officer",
        departmentId: department._id,
        designation: `${name} Nodal Officer`,
        gender: officerNumber % 2 === 0 ? "female" : "male",
        isActive: true,
      });
      officers.push(officer);
      officerCount++;
    }

    for (let employeeNumber = 1; employeeNumber <= 2; employeeNumber += 1) {
      const officer = officers[(employeeNumber - 1) % officers.length];
      await upsertUser({
        name: `${name} Field Staff ${employeeNumber}`,
        email: `${code.toLowerCase()}-employee-${employeeNumber}@sathyamangalam.gov.in`,
        phone: `9100${code.padStart(4, "0").slice(0, 4)}${employeeNumber}`.slice(0, 10),
        password,
        role: "employee",
        departmentId: department._id,
        officerId: officer._id,
        designation: `${name} Field Executive`,
        gender: employeeNumber % 2 === 0 ? "female" : "male",
        isActive: true,
      });
      employeeCount++;
    }
  }

  // Higher Official
  await upsertUser({
    name: "Dr. K. Senthil Nathan, IAS",
    email: "higher.official@sathyamangalam.gov.in",
    phone: "9842000001",
    password,
    role: "higher_official",
    designation: "District / Municipal Higher Official",
    gender: "male",
    address: "Municipal Administrative Office, Sathyamangalam",
    isActive: true,
  });

  // Admin
  await upsertUser({
    name: "System Administrator",
    email: "admin@sathyamangalam.gov.in",
    phone: "9842000002",
    password,
    role: "admin",
    designation: "Head of Grievance Redressal Cell",
    gender: "male",
    address: "e-Governance Centre, Sathyamangalam",
    isActive: true,
  });

  // Demo Citizens
  const citizens = [
    {
      name: "Anitha R",
      email: "anitha.citizen@sathyamangalam.gov.in",
      phone: "9842100001",
      address: "12, Nadar Colony, Ward 1, Sathyamangalam",
      gender: "female",
      differentlyAbled: false,
    },
    {
      name: "Karthik M",
      email: "karthik.citizen@sathyamangalam.gov.in",
      phone: "9842100002",
      address: "8, Bazaar Street, Ward 16, Sathyamangalam",
      gender: "male",
      differentlyAbled: false,
    },
    {
      name: "Meena S",
      email: "meena.citizen@sathyamangalam.gov.in",
      phone: "9842100003",
      address: "21, Athani Road, Ward 11, Sathyamangalam",
      gender: "female",
      differentlyAbled: true,
    },
  ];

  for (const c of citizens) {
    await upsertUser({
      ...c,
      password,
      role: "citizen",
      designation: "Resident Citizen",
      isActive: true,
    });
  }

  console.log(`Seeded ${departments.length} departments, ${officerCount} officers, ${employeeCount} employees, 3 citizens, higher official, and admin.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Municipality seed error:", error);
  await mongoose.disconnect();
  process.exit(1);
});
