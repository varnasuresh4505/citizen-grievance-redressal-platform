require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Department = require("../models/Department");
const User = require("../models/User");
const Location = require("../models/Location");

// Allow passing URI as first CLI argument: node scripts/seedProduction.js "mongodb+srv://..."
const targetUri = process.argv[2] || process.env.MONGO_URI;

if (!targetUri) {
  console.error("\n❌ Error: Please provide a MongoDB connection string.");
  console.error("Usage: node scripts/seedProduction.js \"mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net/citizen_grievance_db\"\n");
  process.exit(1);
}

// 27 Sathyamangalam Wards
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

// 16 Sathyamangalam Departments
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

async function runProductionSeed() {
  console.log("=================================================");
  console.log("🌱 CivicResolve Production Database Seeder");
  console.log("=================================================");
  console.log(`Connecting to: ${targetUri.replace(/:([^:@]+)@/, ":****@")} ...`);

  await mongoose.connect(targetUri);
  console.log("✅ Database connection established.\n");

  // 1. Seed Wards
  console.log("1️⃣ Seeding 27 Sathyamangalam Municipal Wards...");
  for (const ward of wards) {
    await Location.findOneAndUpdate(
      { wardNumber: ward.wardNumber },
      { $set: ward },
      { new: true, upsert: true, runValidators: true }
    );
  }
  const wardCount = await Location.countDocuments();
  console.log(`   ✅ Wards populated: ${wardCount}/27\n`);

  // 2. Seed Departments
  console.log("2️⃣ Seeding 16 Municipal Departments...");
  const password = await bcrypt.hash(process.env.SEED_PASSWORD || "ChangeMe@123", 10);
  const activeCodes = departments.map((d) => d[1]);
  await Department.updateMany({ code: { $nin: activeCodes } }, { $set: { isActive: false } });

  let officerCount = 0;
  let employeeCount = 0;

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
  const deptCount = await Department.countDocuments({ isActive: true });
  console.log(`   ✅ Departments populated: ${deptCount}/16`);
  console.log(`   ✅ Nodal Officers seeded: ${officerCount}`);
  console.log(`   ✅ Field Staff seeded: ${employeeCount}\n`);

  // 3. Administrative Accounts
  console.log("3️⃣ Seeding System Administrator & Higher Official...");
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
  console.log("   ✅ Admin: admin@sathyamangalam.gov.in (password: ChangeMe@123)");
  console.log("   ✅ Higher Official: higher.official@sathyamangalam.gov.in (password: ChangeMe@123)\n");

  // 4. Demo Citizens
  console.log("4️⃣ Seeding Demo Citizens...");
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
  console.log("   ✅ 3 Demo Citizens seeded (password: ChangeMe@123)\n");

  console.log("=================================================");
  console.log("🎉 Production Database Successfully Initialized!");
  console.log("=================================================");
  await mongoose.disconnect();
}

runProductionSeed().catch(async (err) => {
  console.error("\n❌ Seeding Failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
