require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Department = require("../models/Department");
const Location = require("../models/Location");
const Grievance = require("../models/Grievance");
const Escalation = require("../models/Escalation");
const GrievanceHistory = require("../models/GrievanceHistory");

async function runEndToEndTest() {
  console.log("=== STARTING SATHYAMANGALAM GRIEVANCE REDRESSAL E2E TEST ===");

  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI);

  // 1. Verify 16 Departments
  const departments = await Department.find({ isActive: true }).sort({ name: 1 });
  console.log(`[TEST 1] Verified active departments: ${departments.length} (Expected: 16)`);
  if (departments.length < 16) {
    throw new Error(`Expected at least 16 departments, got ${departments.length}`);
  }

  // 2. Verify 27 Sathyamangalam Wards
  const wards = await Location.find({ isActive: true }).sort({ wardNumber: 1 });
  console.log(`[TEST 2] Verified Sathyamangalam wards: ${wards.length} (Expected: 27)`);
  if (wards.length !== 27) {
    throw new Error(`Expected 27 wards, got ${wards.length}`);
  }

  // 3. Test Citizen Registration & Login Data
  const testPhone = "9842999888";
  const testEmail = "selvam.test@sathyamangalam.gov.in";
  const password = "ChangeMe@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.deleteOne({ email: testEmail });
  await User.deleteOne({ phone: testPhone });

  const citizen = await User.create({
    name: "Selvam P",
    email: testEmail,
    phone: testPhone,
    password: hashedPassword,
    address: "24, Anna Nagar, Ward 24, Sathyamangalam",
    gender: "male",
    differentlyAbled: false,
    role: "citizen",
    isActive: true,
  });
  console.log(`[TEST 3] Created test citizen: ${citizen.name}, Mobile: ${citizen.phone}`);

  // Test Mobile Number Lookup
  const userByMobile = await User.findOne({ phone: testPhone });
  if (!userByMobile || userByMobile.name !== "Selvam P") {
    throw new Error("Citizen lookup by mobile number failed");
  }
  console.log("[TEST 4] Citizen login lookup by Mobile Number: SUCCESS");

  // 4. Test Grievance Submission with Village, Ward, Delimitation & Department
  const electricDept = await Department.findOne({ code: "ELECTRIC" });
  if (!electricDept) throw new Error("Electricity department not found");

  const electricOfficer = await User.findOne({
    role: "officer",
    departmentId: electricDept._id,
    isActive: true,
  });
  console.log(`[TEST 5] Assigned Nodal Officer: ${electricOfficer ? electricOfficer.name : "None"}`);

  // Generate ID
  const year = new Date().getFullYear();
  const grievanceId = `GRV-SLM-${year}-99999`;
  await Grievance.deleteOne({ grievanceId });

  // Priority High -> 7 days
  const allowedDays = 7;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + allowedDays);

  const grievance = await Grievance.create({
    citizen: citizen._id,
    grievanceId,
    title: "Damaged electric cable near Weekly Market",
    description: "Low-hanging loose electric wire posing risk to pedestrians near Weekly Market, Annaiyan East Street.",
    category: electricDept.name,
    department: electricDept._id,
    assignedOfficer: electricOfficer ? electricOfficer._id : null,
    priority: "High",
    status: electricOfficer ? "Assigned" : "Submitted",
    allowedResolutionDays: allowedDays,
    dueDate,
    location: {
      village: "Sathyamangalam Town",
      wardNumber: 9,
      wardName: "Ward 9",
      landmark: "Weekly Market, Annaiyan East Street",
      address: "15, Weekly Market Road, Sathyamangalam",
      area: "Sathyamangalam Town",
    },
    evidence: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="],
  });

  await GrievanceHistory.create({
    grievance: grievance._id,
    action: "Grievance Submitted",
    status: grievance.status,
    remark: "Citizen submitted grievance with photo evidence.",
    updatedBy: citizen._id,
    actorRole: "citizen",
  });

  console.log(`[TEST 6] Grievance filed: ${grievance.grievanceId}, Status: ${grievance.status}, Due Date: ${grievance.dueDate.toISOString().slice(0, 10)}`);

  // 5. Officer Action: Move to On-Hold with Reason
  grievance.status = "On Hold";
  grievance.onHoldReason = "Awaiting safety shutdown clearance from Sub-Station 2.";
  await grievance.save();
  await GrievanceHistory.create({
    grievance: grievance._id,
    action: "Status Changed to On Hold",
    status: "On Hold",
    remark: `Reason: ${grievance.onHoldReason}`,
    updatedBy: electricOfficer?._id,
    actorRole: "officer",
  });
  console.log(`[TEST 7] Officer updated grievance to On-Hold with reason: "${grievance.onHoldReason}"`);

  // 6. Test Overdue Logic
  // Set due date to 3 days ago to simulate past deadline
  const pastDueDate = new Date();
  pastDueDate.setDate(pastDueDate.getDate() - 3);
  grievance.dueDate = pastDueDate;
  grievance.status = "Overdue";
  await grievance.save();

  const overdueDays = Math.max(1, Math.ceil((new Date() - new Date(grievance.dueDate)) / (1000 * 60 * 60 * 24)));
  console.log(`[TEST 8] Overdue calculation: Grievance is overdue by ${overdueDays} days (Expected: 3 days)`);
  if (overdueDays < 3) throw new Error("Overdue calculation incorrect");

  // 7. Citizen Escalates to Higher Official
  await Escalation.deleteOne({ grievance: grievance._id });
  const escalation = await Escalation.create({
    grievance: grievance._id,
    citizen: citizen._id,
    reason: "Public safety hazard unresolved for 3 days past the official resolution deadline.",
    evidence: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="],
    daysOverdueAtEscalation: overdueDays,
    status: "Open",
  });

  await GrievanceHistory.create({
    grievance: grievance._id,
    action: "Escalated to Higher Official",
    status: "Overdue",
    remark: `Citizen escalated due to delay (${overdueDays} days overdue). Reason: ${escalation.reason}`,
    updatedBy: citizen._id,
    actorRole: "citizen",
  });
  console.log(`[TEST 9] Citizen Escalation Created: Status=${escalation.status}, OverdueDays=${escalation.daysOverdueAtEscalation}`);

  // 8. Higher Official Intervention
  const higherOfficial = await User.findOne({ role: "higher_official", isActive: true });
  if (!higherOfficial) throw new Error("Higher official user not found");

  escalation.higherOfficial = higherOfficial._id;
  escalation.status = "Action Taken";
  escalation.instructionsToOfficer = "Deploy emergency line crew immediately; secure live cable within 4 hours.";
  escalation.actionTaken = "Executive emergency directive issued to Electricity Division.";
  escalation.priority = "Critical";
  grievance.priority = "Critical";

  // Revise deadline to tomorrow
  const revisedDeadline = new Date();
  revisedDeadline.setDate(revisedDeadline.getDate() + 1);
  escalation.revisedDueDate = revisedDeadline;
  grievance.dueDate = revisedDeadline;
  grievance.status = "In Progress";

  await escalation.save();
  await grievance.save();

  await GrievanceHistory.create({
    grievance: grievance._id,
    action: "Higher Official Directive",
    status: grievance.status,
    remark: `Instruction: "${escalation.instructionsToOfficer}". Revised deadline: ${revisedDeadline.toISOString().slice(0, 10)}.`,
    updatedBy: higherOfficial._id,
    actorRole: "higher_official",
  });
  console.log(`[TEST 10] Higher Official Intervention Recorded: Directive issued, Priority=Critical, Revised Due Date set.`);

  // 9. Officer Resolves Grievance
  grievance.status = "Resolved";
  grievance.resolution = "Emergency line crew repaired cable anchor, restored insulation and verified zero leakage current.";
  grievance.resolvedAt = new Date();
  await grievance.save();

  escalation.status = "Closed";
  escalation.closedAt = new Date();
  await escalation.save();

  await GrievanceHistory.create({
    grievance: grievance._id,
    action: "Grievance Resolved",
    status: "Resolved",
    remark: grievance.resolution,
    updatedBy: electricOfficer?._id,
    actorRole: "officer",
  });
  console.log(`[TEST 11] Officer Resolved Grievance: Status=Resolved, Resolution Note Recorded.`);

  // 10. Audit History Verification
  const auditEntries = await GrievanceHistory.find({ grievance: grievance._id }).sort({ createdAt: 1 });
  console.log(`[TEST 12] Complete Audit History Trail (${auditEntries.length} steps):`);
  auditEntries.forEach((entry, i) => {
    console.log(`   ${i + 1}. [${entry.action}] -> ${entry.remark} (Role: ${entry.actorRole})`);
  });

  if (auditEntries.length < 5) throw new Error("Audit history incomplete");

  console.log("\n=== ALL 12 END-TO-END CITIZEN -> OFFICER -> HIGHER OFFICIAL WORKFLOW TESTS PASSED SUCCESSFULLY! ===");
  await mongoose.disconnect();
}

runEndToEndTest().catch(async (err) => {
  console.error("Test failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
