/* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import Breadcrumb from "../components/Breadcrumb";
import { StatusBadge, PriorityBadge, CivicFooter } from "../components/UI";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  User,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Check,
  UserCheck,
  Info,
  Phone,
  Mail,
  AlertOctagon,
  Sparkles,
  Star,
} from "lucide-react";

export default function OfficerGrievanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("");
  const [resolution, setResolution] = useState("");
  const [onHoldReason, setOnHoldReason] = useState("");
  const [isEditingResolution, setIsEditingResolution] = useState(false);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [assigningTask, setAssigningTask] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchGrievance();
  }, [id]);

  useEffect(() => {
    if (!success) return undefined;
    const timeout = window.setTimeout(() => setSuccess(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  async function fetchGrievance() {
    try {
      setError("");

      const data = await apiRequest(`/officer/grievances/${id}`);
      const foundGrievance = data.grievance;

      if (!foundGrievance) throw new Error("Grievance not found or not assigned to you");

      setGrievance(foundGrievance);
      setTasks(data.tasks || []);
      setStatus(foundGrievance.status || "Assigned");
      setResolution(foundGrievance.resolution || "");
      setOnHoldReason(foundGrievance.onHoldReason || "");

      const employeeData = await apiRequest("/officer/employees");
      setEmployees(employeeData.employees || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (status === "Resolved" && resolution.trim() === "") {
      setError("Please provide a certified resolution summary before marking the grievance as resolved.");
      return;
    }

    if (status === "On Hold" && onHoldReason.trim() === "") {
      setError("Please specify the official justification for placing this grievance on hold.");
      return;
    }

    try {
      setUpdating(true);

      const data = await apiRequest(
        `/officer/grievances/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
            resolution,
            onHoldReason,
          }),
        }
      );

      setGrievance(data.grievance);
      setStatus(data.grievance.status || status);
      if (["Resolved", "Closed"].includes(data.grievance.status || status)) {
        setIsEditingResolution(false);
      }
      setSuccess("Official case status and resolution record updated successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees((current) =>
      current.includes(employeeId)
        ? current.filter((i) => i !== employeeId)
        : [...current, employeeId]
    );
  };

  const handleTaskAssignment = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedEmployees.length) {
      setError("Select at least one field staff employee to assign work.");
      return;
    }

    try {
      setAssigningTask(true);
      const data = await apiRequest("/tasks/assign", {
        method: "POST",
        body: JSON.stringify({
          grievanceId: id,
          employees: selectedEmployees,
          taskDescription,
          deadline: deadline || undefined,
        }),
      });

      setTasks((current) => [...data.tasks, ...current]);
      setSelectedEmployees([]);
      setTaskDescription("");
      setDeadline("");
      setStatus("In Progress");
      setGrievance((current) => ({ ...current, status: "In Progress" }));
      setSuccess(`${data.count} field task${data.count === 1 ? "" : "s"} dispatched to staff successfully.`);
    } catch (assignmentError) {
      setError(assignmentError.message);
    } finally {
      setAssigningTask(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <CivicHeader activeRole="officer" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545]" />
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Loading grievance case management dossier...
            </p>
          </div>
        </div>
        <CivicFooter />
      </div>
    );
  }

  if (error && !grievance) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <CivicHeader activeRole="officer" />
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow-xs border border-rose-200 text-center">
            <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900 mb-1">Grievance Not Accessible</p>
            <p className="text-xs text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/officer")}
              className="rounded-xl bg-[#0b2545] px-4 py-2 text-xs font-bold text-white hover:bg-[#133e6a] transition"
            >
              Return to Officer Queue
            </button>
          </div>
        </div>
        <CivicFooter />
      </div>
    );
  }

  const isOverdue = grievance.status === "Overdue" || grievance.isOverdue;
  const isOnHold = grievance.status === "On Hold";
  const isResolved = ["Resolved", "Closed"].includes(grievance.status);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. CIVIC HEADER */}
      <CivicHeader activeRole="officer" />

      {/* 2. BREADCRUMB NAVIGATION */}
      <Breadcrumb
        items={[
          { label: "Officer Queue", href: "/officer" },
          { label: "Case Redressal" },
          { label: grievance.grievanceId || "Docket" },
        ]}
        rightContent={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              {grievance.grievanceId}
            </span>
            <StatusBadge status={grievance.status} isOverdue={isOverdue} />
          </div>
        }
      />

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Success toast */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
            <AlertTriangle className="h-5 w-5 text-rose-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* OVERDUE NOTICE */}
        {isOverdue && (
          <div className="mb-6 rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs flex items-center gap-3 shadow-2xs">
            <AlertOctagon className="h-5 w-5 text-rose-700 shrink-0" />
            <div>
              <span className="font-bold text-rose-900">SLA Breach Notice: </span>
              <span className="text-rose-800">
                This grievance is overdue by {grievance.overdueDays || 1} day{(grievance.overdueDays || 1) > 1 ? "s" : ""}. It is monitored on the Higher Official dashboard and subject to binding directives.
              </span>
            </div>
          </div>
        )}

        {/* HIGHER OFFICIAL DIRECTIVE BANNER */}
        {grievance.escalation?.instructionsToOfficer && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs shadow-2xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                  Binding Directive from Higher Official
                </p>
                <p className="mt-1 font-semibold text-slate-800 italic">
                  "{grievance.escalation.instructionsToOfficer}"
                </p>
                <p className="mt-1 text-[11px] text-amber-800">
                  Escalated on: {formatDate(grievance.escalation.escalatedAt || grievance.escalation.createdAt)} • Status: {grievance.escalation.status}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2-COLUMN DOSSIER GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: CASE DETAILS & UPDATE FORM */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Details Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Docket ID: {grievance.grievanceId}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 leading-snug mt-0.5">
                    {grievance.title}
                  </h2>
                </div>

                <PriorityBadge priority={grievance.priority} />
              </div>

              {/* AI-GENERATED OFFICER BRIEFING SUMMARY */}
              <div className="mb-4 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/40 p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2 mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span>AI-Generated Summary — Officer Briefing</span>
                  </span>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    grievance.aiAnalysis?.processingStatus === "completed"
                      ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {grievance.aiAnalysis?.processingStatus === "completed" ? "Automated AI Triage" : "Advisory Status"}
                  </span>
                </div>
                <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                  {grievance.aiAnalysis?.summary || "Automated AI briefing summary unavailable. Please review original citizen complaint below."}
                </p>
                <p className="mt-2 text-[10px] text-indigo-700/80 italic flex items-center gap-1">
                  <Info className="h-3 w-3 shrink-0" />
                  <span>AI-generated rapid triage briefing. Compare with unaltered citizen complaint.</span>
                </p>
              </div>

              {/* CITIZEN COMPLAINT DESCRIPTION (UNALTERED ORIGINAL) */}
              

              {/* Evidence */}
              {grievance.evidence && grievance.evidence.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Attached Evidence Photo / Document
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {grievance.evidence.map((img, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-slate-200 max-w-xs shadow-2xs">
                        {img.startsWith("data:image") ? (
                          <img src={img} alt="Evidence" className="h-40 w-auto object-cover" />
                        ) : (
                          <div className="p-3 bg-slate-100 text-xs font-semibold text-slate-700">
                            Attachment #{i + 1}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FIELD WORK DEPLOYMENT */}
            {/* <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"> */}
              {/* <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                    Field Execution
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Assign Field Staff to Case
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {tasks.length} Task{tasks.length === 1 ? "" : "s"} Assigned
                </span>
              </div> */}

              {/* {employees.length === 0 ? (
                <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  No field staff employees currently registered under your department.
                </p>
              ) : (
                <form onSubmit={handleTaskAssignment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Select Department Field Staff
                    </label>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {employees.map((employee) => (
                        <label
                          key={employee._id}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition text-xs ${
                            selectedEmployees.includes(employee._id)
                              ? "border-blue-700 bg-blue-50/60"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee._id)}
                            onChange={() => toggleEmployee(employee._id)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#0b2545]"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{employee.name}</span>
                            <span className="text-[11px] text-slate-500">
                              {employee.activeTasks || 0} active task{(employee.activeTasks || 0) === 1 ? "" : "s"} • {employee.availability || "Available"}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Specific Field Work Instructions
                      </label>
                      <textarea
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        rows="2"
                        placeholder="Instruct field staff on repair materials, inspection points, or safety measures..."
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Task Deadline
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800"
                      />
                      <p className="mt-1 text-[10px] text-slate-500">Defaults to case SLA due date</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={assigningTask || !selectedEmployees.length}
                    className="rounded-xl bg-[#0b2545] px-4 py-2 text-xs font-bold text-white hover:bg-[#133e6a] transition disabled:opacity-50"
                  >
                    {assigningTask
                      ? "Dispatching Tasks..."
                      : `Assign to ${selectedEmployees.length || "Selected"} Employee${selectedEmployees.length === 1 ? "" : "s"}`}
                  </button>
                </form>
              )} */}

              {/* Existing Tasks List
              {tasks.length > 0 && (
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Dispatched Field Tasks
                  </p>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task._id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{task.employee?.name || "Staff Member"}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{task.taskDescription || "Field inspection & redressal"}</p>
                        </div>
                        <span className="rounded-full bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-900">
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            {/* </div> */}

            {/* STATUS UPDATE & RESOLUTION SECTION */}
            {isResolved && !isEditingResolution ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-emerald-950">
                        Official Resolution Certified & Closed
                      </h3>
                      <p className="text-[11px] text-emerald-800">
                        {grievance.resolvedAt
                          ? `Certified resolved on ${formatDate(grievance.resolvedAt)}`
                          : "Official resolution recorded in municipal registry"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingResolution(true)}
                    className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition shadow-2xs"
                  >
                    Amend Resolution Note
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
                      Certified Resolution Statement:
                    </span>
                    <p className="rounded-xl border border-emerald-200 bg-white p-4 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {grievance.resolution || resolution}
                    </p>
                  </div>

                  {grievance.onHoldReason && (
                    <div className="pt-2 border-t border-emerald-200/60 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Prior On-Hold Justification: </span>
                      <span>{grievance.onHoldReason}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {isResolved ? "Amend Official Resolution Note" : "Update Status & Record Resolution"}
                  </h3>
                  {isResolved && (
                    <button
                      type="button"
                      onClick={() => setIsEditingResolution(false)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Processing Status <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 bg-white"
                    >
                      <option value="Assigned">Assigned (Initial Review)</option>
                      <option value="In Progress">In Progress (Field Work Underway)</option>
                      <option value="On Hold">On Hold (Mandatory Justification Required)</option>
                      <option value="Resolved">Resolved (Closure Summary Required)</option>
                    </select>
                  </div>

                  {/* ON HOLD REASON MANDATORY INPUT */}
                  {status === "On Hold" && (
                    <div className="rounded-xl bg-amber-50 border border-amber-300 p-4">
                      <label className="block text-xs font-bold text-amber-950 mb-1">
                        Official Reason for Placing On Hold <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        value={onHoldReason}
                        onChange={(e) => setOnHoldReason(e.target.value)}
                        rows="3"
                        placeholder="Specify the technical delay, required permits, or missing materials..."
                        required
                        className="w-full rounded-lg border border-amber-300 p-2.5 text-xs text-slate-900 bg-white focus:outline-hidden"
                      />
                      <p className="mt-1 text-[11px] text-amber-800">
                        This justification is legally bound to the citizen's tracking portal and executive audits.
                      </p>
                    </div>
                  )}

                  {/* RESOLUTION MESSAGE INPUT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Resolution Note {status === "Resolved" && <span className="text-rose-600">*</span>}
                    </label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      rows="3"
                      placeholder={
                        status === "Resolved"
                          ? "Detail how the grievance was resolved, work completed, and verification performed..."
                          : "Optional progress notes or milestone remarks..."
                      }
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-hidden"
                    />
                    {status === "Resolved" && (
                      <p className="mt-1 text-[11px] text-rose-700 font-semibold">
                        A clear resolution statement is required to certify closure.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {isResolved && (
                      <button
                        type="button"
                        onClick={() => setIsEditingResolution(false)}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={updating}
                      className="rounded-xl bg-[#0b2545] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#133e6a] transition shadow-xs disabled:opacity-50"
                    >
                      {updating ? "Recording Update..." : isResolved ? "Save Amended Resolution" : "Update Official Record"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CITIZEN & JURISDICTION SUMMARY */}
          <div className="space-y-6">
            {/* Citizen Record */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3">
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <User className="h-4 w-4 text-blue-800" />
                <span>Complainant Details</span>
              </p>

              {grievance.citizen ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Name:</span>
                    <span className="font-bold text-slate-900">{grievance.citizen.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Mobile:</span>
                    <span className="font-bold text-slate-900">+91 {grievance.citizen.phone}</span>
                  </div>
                  <div className="flex justify-between truncate">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="font-medium text-slate-800 truncate">{grievance.citizen.email}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-1 font-medium">Registered Address:</span>
                    <p className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700 leading-snug">
                      {grievance.citizen.address || "Sathyamangalam, Erode District"}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-slate-400">Citizen profile not available.</p>
              )}
            </div>

            {/* Jurisdiction & SLA */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3">
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <MapPin className="h-4 w-4 text-blue-800" />
                <span>Jurisdiction & SLA Target</span>
              </p>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Ward Jurisdiction:</span>
                <span className="font-bold text-blue-900">Ward {grievance.location?.wardNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Locality:</span>
                <span className="font-bold text-slate-800">{grievance.location?.village || "Sathyamangalam"}</span>
              </div>
              {grievance.location?.landmark && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Landmark:</span>
                  <span className="font-medium text-slate-800">{grievance.location.landmark}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Registration Date:</span>
                <span className="font-medium text-slate-800">{formatDate(grievance.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Target Resolution Date:</span>
                <span className={`font-bold ${isOverdue ? "text-rose-700" : "text-emerald-700"}`}>
                  {formatDate(grievance.dueDate)}
                </span>
              </div>
            </div>

            {/* Citizen Feedback Record */}
            {grievance.feedback?.rating && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <p className="font-bold text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span>Citizen Resolution Feedback</span>
                  </p>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200">
                    {grievance.feedback.rating}/5 Stars
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= grievance.feedback.rating
                          ? "text-amber-500 fill-amber-500"
                          : "text-amber-200"
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 text-xs font-bold text-amber-950">
                    {grievance.feedback.rating === 5 && "Very Satisfied"}
                    {grievance.feedback.rating === 4 && "Satisfied"}
                    {grievance.feedback.rating === 3 && "Neutral"}
                    {grievance.feedback.rating === 2 && "Unsatisfied"}
                    {grievance.feedback.rating === 1 && "Very Unsatisfied"}
                  </span>
                </div>

                {grievance.feedback.comment ? (
                  <p className="bg-white/90 p-3 rounded-xl border border-amber-200 text-slate-800 leading-relaxed italic">
                    "{grievance.feedback.comment}"
                  </p>
                ) : (
                  <p className="text-slate-500 italic">No written citizen remarks entered.</p>
                )}

                {grievance.feedback.submittedAt && (
                  <p className="text-[10px] text-amber-800 font-medium pt-1 border-t border-amber-200/60">
                    Submitted on: {formatDate(grievance.feedback.submittedAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. CIVIC FOOTER */}
      <CivicFooter />
    </div>
  );
}
