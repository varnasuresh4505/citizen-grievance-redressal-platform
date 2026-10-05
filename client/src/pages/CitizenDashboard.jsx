import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import { StatusBadge, PriorityBadge, CivicFooter } from "../components/UI";
import {
  FilePlus2,
  Building2,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
  User,
  X,
  Upload,
  Info,
  ChevronRight,
  Sparkles,
} from "lucide-react";

function CitizenDashboard() {
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Profile modal state
  const [showProfile, setShowProfile] = useState(false);

  // Escalation modal state
  const [escalatingGrievance, setEscalatingGrievance] = useState(null);
  const [escalationReason, setEscalationReason] = useState("");
  const [escalationEvidence, setEscalationEvidence] = useState("");
  const [submittingEscalation, setSubmittingEscalation] = useState(false);
  const [escalationSuccess, setEscalationSuccess] = useState("");
  const [escalationError, setEscalationError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadGrievances = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/grievances/my");
      setGrievances(data.grievances || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, []);

  // Filter grievances according to tabs
  const openGrievances = grievances.filter(
    (g) =>
      ["Submitted", "Assigned", "Under Review", "In Progress"].includes(
        g.status
      ) && !g.isOverdue
  );

  const onHoldGrievances = grievances.filter(
    (g) => g.status === "On Hold"
  );

  const overdueGrievances = grievances.filter(
    (g) => g.status === "Overdue" || g.isOverdue
  );

  const resolvedGrievances = grievances.filter((g) =>
    ["Resolved", "Closed"].includes(g.status)
  );

  const displayedGrievances =
    activeTab === "open"
      ? openGrievances
      : activeTab === "on_hold"
      ? onHoldGrievances
      : activeTab === "overdue"
      ? overdueGrievances
      : activeTab === "resolved"
      ? resolvedGrievances
      : grievances;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Handle opening escalation modal
  const openEscalationModal = (grievance) => {
    setEscalatingGrievance(grievance);
    setEscalationReason("");
    setEscalationEvidence("");
    setEscalationError("");
    setEscalationSuccess("");
  };

  // Handle escalation photo/file upload
  const handleEvidenceFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setEscalationEvidence(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // Submit escalation to higher official
  const handleEscalationSubmit = async (e) => {
    e.preventDefault();

    if (!escalationReason.trim()) {
      setEscalationError(
        "Please provide a reason for escalating this delayed grievance."
      );
      return;
    }

    try {
      setSubmittingEscalation(true);
      setEscalationError("");

      await apiRequest("/escalations", {
        method: "POST",
        body: JSON.stringify({
          grievanceId: escalatingGrievance._id,
          reason: escalationReason.trim(),
          evidence: escalationEvidence ? [escalationEvidence] : [],
        }),
      });

      setEscalationSuccess(
        "Grievance escalated to Higher Official successfully!"
      );

      setTimeout(() => {
        setEscalatingGrievance(null);
        loadGrievances();
      }, 1500);
    } catch (err) {
      setEscalationError(err.message);
    } finally {
      setSubmittingEscalation(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. OFFICIAL CIVIC HEADER WITH PROFILE DROPDOWN */}
      <CivicHeader
        activeRole="citizen"
        onOpenProfile={() => setShowProfile(true)}
      />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">

          {/* CITIZEN WELCOME & ACTION BANNER */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-3xl">

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-[13px] font-bold text-blue-800 ring-1 ring-inset ring-blue-700/20">
                    <MapPin className="h-3.5 w-3.5 text-blue-700" />
                    <span>
                      Sathyamangalam Municipality • 27 Wards
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[13px] font-bold text-emerald-800 ring-1 ring-inset ring-emerald-700/20">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                    <span>
                      Tamil Nadu Right to Service Standard
                    </span>
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-snug">
                  Welcome, {user?.name || "Resident"} !
                </h2>

                <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                  Submit municipal complaints, track official progress across
                  16 Sathyamangalam departments, and review time-bound
                  resolution. 
                </p>
              </div>

              {/* Quick Action Button */}
              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowProfile(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition"
                >
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Citizen Profile</span>
                </button>

                <button
                  onClick={() => navigate("/citizen/submit")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b2545] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#133e6a] transition"
                >
                  <FilePlus2 className="h-4 w-4 text-amber-400" />
                  <span>+ File New Grievance</span>
                </button>
              </div>
            </div>
          </section>

          {/* HOW THE PLATFORM WORKS - INSTITUTIONAL PROCESS STEPPER */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 border-b border-slate-100 pb-3">
              <div>
            

                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  Sathyamangalam Grievance Redressal Lifecycle
                </h3>
              </div>

              <span className="text-[11px] font-medium text-slate-500">
                Transparent 4-Phase Administrative SLA
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#0b2545] text-[11px] font-black text-white">
                  1
                </div>

                <div>
                  <p className="text-[12px] font-bold text-slate-900">
                    File Online
                  </p>

                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Select ward, municipal department, SLA priority, and attach
                    photo proof.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-900 text-[11px] font-black text-white">
                  2
                </div>

                <div>
                  <p className="text-[12px] font-bold text-slate-900">
                    Nodal Assignment
                  </p>

                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Automated routing to designated department officer with
                    countdown clock.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-700 text-[11px] font-black text-white">
                  3
                </div>

                <div>
                  <p className="text-[12px] font-bold text-slate-900">
                    Field Resolution
                  </p>

                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Inspection and action within fixed SLA (Critical: 3d, High:
                    7d, Med: 10d).
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-800 text-[11px] font-black text-white">
                  4
                </div>

                <div>
                  <p className="text-[12px] font-bold text-slate-900">
                    Closure or Escalation
                  </p>

                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Verified closure notes. If overdue, direct citizen
                    escalation to Higher Official.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* TRACK GRIEVANCE SECTION */}
          <section className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Track Your Filed Grievances
                </h3>
              </div>

              {/* Status Tab Filters */}
              <div className="flex flex-wrap gap-1.5 bg-slate-200/80 p-1 rounded-xl text-[11px] font-bold">

                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === "all"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({grievances.length})
                </button>

                <button
                  onClick={() => setActiveTab("open")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === "open"
                      ? "bg-white text-blue-800 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Active ({openGrievances.length})
                </button>

                <button
                  onClick={() => setActiveTab("on_hold")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === "on_hold"
                      ? "bg-white text-amber-800 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  On-Hold ({onHoldGrievances.length})
                </button>

                <button
                  onClick={() => setActiveTab("overdue")}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === "overdue"
                      ? "bg-rose-700 text-white shadow-2xs"
                      : "text-rose-700 hover:bg-rose-100/50"
                  }`}
                >
                  <span>Overdue</span>

                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === "overdue"
                        ? "bg-white text-rose-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {overdueGrievances.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("resolved")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === "resolved"
                      ? "bg-white text-emerald-800 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Resolved ({resolvedGrievances.length})
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-[11px] font-semibold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-xs">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545]" />

                <p className="mt-3 text-[13px] font-semibold text-slate-500">
                  Retrieving official grievance records from Sathyamangalam
                  database...
                </p>
              </div>
            )}

            {/* Empty state */}
            {!loading && displayedGrievances.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white py-12 px-4 text-center shadow-xs">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <FileText className="h-6 w-6" />
                </div>

                <h4 className="mt-3 text-xs font-bold text-slate-900">
                  {activeTab === "all"
                    ? "No grievances submitted yet"
                    : `No ${activeTab.replace("_", " ")} complaints found`}
                </h4>

                <p className="mt-1 text-[13px] text-slate-500 max-w-sm mx-auto">
                  {activeTab === "all"
                    ? "You haven't filed any municipal complaints yet. File a grievance to track redressal under the citizen charter."
                    : `Currently there are no grievances matching the ${activeTab.replace(
                        "_",
                        " "
                      )} filter.`}
                </p>

                {activeTab === "all" && (
                  <button
                    onClick={() => navigate("/citizen/submit")}
                    className="mt-4 rounded-xl bg-[#0b2545] px-4 py-2 text-[13px] font-bold text-white shadow-xs hover:bg-[#133e6a] transition"
                  >
                    + Submit Your First Grievance
                  </button>
                )}
              </div>
            )}

            {/* Grievances List */}
            {!loading && displayedGrievances.length > 0 && (
              <div className="space-y-3.5">
                {displayedGrievances.map((g) => {
                  const isOverdue =
                    g.status === "Overdue" || g.isOverdue;

                  const isOnHold = g.status === "On Hold";

                  const isResolved = ["Resolved", "Closed"].includes(
                    g.status
                  );

                  return (
                    <article
                      key={g._id}
                      className={`overflow-hidden rounded-xl border bg-white shadow-2xs transition hover:shadow-xs ${
                        isOverdue
                          ? "border-rose-300 ring-1 ring-rose-200"
                          : isOnHold
                          ? "border-amber-300"
                          : "border-slate-200"
                      }`}
                    >
                      {/* Top color indicator */}
                      <div
                        className={`h-1 w-full ${
                          isOverdue
                            ? "bg-rose-600"
                            : isOnHold
                            ? "bg-amber-500"
                            : isResolved
                            ? "bg-emerald-600"
                            : "bg-[#0b2545]"
                        }`}
                      />

                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

                          {/* Case Title, ID, Department, Priority */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">

                              <span className="font-mono text-[13px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                                {g.grievanceId}
                              </span>

                              <span className="inline-flex items-center gap-1 text-[13px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
                                <Building2 className="h-3 w-3 text-slate-500" />
                                <span>
                                  {g.department?.name || g.category}
                                </span>
                              </span>

                              <PriorityBadge priority={g.priority} />

                              {/* Escalated badge if applicable */}
                              {g.escalation && (
                                <span className="inline-flex items-center gap-1 text-[13px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300">
                                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                                  <span>
                                    Escalation: {g.escalation.status}
                                  </span>
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {g.title}
                            </h4>

                            
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0 flex sm:flex-col items-start sm:items-end gap-1.5">
                            <StatusBadge
                              status={g.status}
                              isOverdue={isOverdue}
                            />

                            {isOverdue && (
                              <span className="text-[12px] font-bold text-rose-700">
                                Overdue by {g.overdueDays || 1} day
                                {(g.overdueDays || 1) > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ON-HOLD REASON BANNER */}
                        {isOnHold && (
                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[13px] text-amber-900 flex items-start gap-2">
                            <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />

                            <div>
                              <span className="font-bold">
                                Hold Justification:{" "}
                              </span>

                              <span>
                                {g.onHoldReason ||
                                  "Temporarily paused while requiring external verification or materials."}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* RESOLUTION MESSAGE BANNER */}
                        {isResolved && g.resolution && (
                          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-[13px] text-emerald-900 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />

                            <div>
                              <span className="font-bold">
                                Officer Resolution:{" "}
                              </span>

                              <span>{g.resolution}</span>
                            </div>
                          </div>
                        )}

                        {/* OVERDUE ESCALATION NOTICE */}
                        {isOverdue && !g.escalation && (
                          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-[13px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="text-rose-900">
                              <span className="font-bold">
                                SLA Guarantee Elapsed:{" "}
                              </span>

                              <span>
                                This complaint has passed its resolution
                                deadline. You are eligible to submit an official
                                escalation directly to Higher Officials.
                              </span>
                            </div>

                            <button
                              onClick={() => openEscalationModal(g)}
                              className="shrink-0 rounded-lg bg-rose-700 px-3.5 py-1.5 text-[13px] font-bold text-white shadow-2xs hover:bg-rose-800 transition"
                            >
                              Escalate to Higher Official
                            </button>
                          </div>
                        )}

                        {/* Case Metadata Footer */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[12px] text-slate-500">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">

                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />

                              <span>
                                Ward {g.location?.wardNumber}
                                {g.location?.village
                                  ? `, ${g.location.village}`
                                  : ""}
                                {g.location?.landmark
                                  ? ` (${g.location.landmark})`
                                  : ""}
                              </span>
                            </span>

                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-400" />

                              <span>
                                Filed: {formatDate(g.createdAt)}
                              </span>
                            </span>

                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />

                              <span>Due: </span>

                              <span
                                className={
                                  isOverdue
                                    ? "text-rose-700 font-bold"
                                    : "text-slate-700"
                                }
                              >
                                {formatDate(g.dueDate)}
                              </span>
                            </span>

                            <span className="text-slate-600">
                              Officer:{" "}

                              {g.assignedOfficer ? (
                                <strong className="text-slate-800">
                                  {g.assignedOfficer.name}
                                </strong>
                              ) : (
                                <span className="italic text-slate-400">
                                  Department review
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {isOverdue && !g.escalation && (
                              <button
                                onClick={() => openEscalationModal(g)}
                                className="font-bold text-rose-700 hover:text-rose-800 text-[13px]"
                              >
                                Escalate
                              </button>
                            )}

                            <button
                              onClick={() =>
                                navigate(
                                  `/citizen/grievance/${g._id}`
                                )
                              }
                              className="font-bold text-blue-800 hover:text-blue-900 text-[13px] inline-flex items-center gap-1"
                            >
                              <span>Case Dossier</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 3. CITIZEN PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">

                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0b2545] text-[11px] font-bold text-amber-400">
                  {user?.name?.slice(0, 2)?.toUpperCase() || "TN"}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Citizen Registration Profile
                  </h3>

                  <p className="text-[10px] text-slate-500">
                    Sathyamangalam Resident Record
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowProfile(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-[11px]">

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">
                  Full Name
                </span>

                <span className="font-bold text-slate-900">
                  {user?.name || "N/A"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">
                  Registered Mobile
                </span>

                <span className="font-bold text-slate-900">
                  +91 {user?.phone || "N/A"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">
                  Email Address
                </span>

                <span className="font-bold text-slate-900">
                  {user?.email || "N/A"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">
                  Gender
                </span>

                <span className="font-bold text-slate-900 capitalize">
                  {user?.gender?.replace(/_/g, " ") ||
                    "Not Specified"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">
                  Differently Abled Status
                </span>

                <span className="font-bold text-slate-900">
                  {user?.differentlyAbled
                    ? "Yes (Priority Consideration)"
                    : "No"}
                </span>
              </div>

              <div className="pt-1.5">
                <span className="text-slate-500 font-medium block mb-1">
                  Residential Address
                </span>

                <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {user?.address ||
                    "Sathyamangalam, Erode District, Tamil Nadu"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowProfile(false)}
                className="rounded-xl bg-[#0b2545] px-4 py-2 text-[11px] font-bold text-white hover:bg-[#133e6a] transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ESCALATION MODAL */}
      {escalatingGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-rose-200">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Official Overdue Escalation
                </span>

                <h3 className="text-sm font-black text-slate-900">
                  Escalate Case to Higher Official
                </h3>
              </div>

              <button
                onClick={() => setEscalatingGrievance(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {escalationError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[11px] font-semibold text-rose-800">
                {escalationError}
              </div>
            )}

            {escalationSuccess && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[11px] font-semibold text-emerald-800">
                {escalationSuccess}
              </div>
            )}

            {/* Read-only grievance summary */}
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-[11px] space-y-1.5">

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">
                  Grievance ID:
                </span>

                <span className="font-mono font-bold text-slate-900">
                  {escalatingGrievance.grievanceId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">
                  Department:
                </span>

                <span className="font-bold text-blue-900">
                  {escalatingGrievance.department?.name ||
                    escalatingGrievance.category}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">
                  Assigned Officer:
                </span>

                <span className="font-bold text-slate-800">
                  {escalatingGrievance.assignedOfficer?.name ||
                    "Municipal Nodal Officer"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">
                  Expected Resolution:
                </span>

                <span className="font-bold text-slate-800">
                  {formatDate(escalatingGrievance.dueDate)}
                </span>
              </div>

              <div className="flex justify-between items-center text-rose-700 font-bold pt-1 border-t border-slate-200">
                <span>Delay Duration:</span>

                <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                  Overdue by{" "}
                  {escalatingGrievance.overdueDays || 1} day
                  {(escalatingGrievance.overdueDays || 1) > 1
                    ? "s"
                    : ""}
                </span>
              </div>
            </div>

            <form
              onSubmit={handleEscalationSubmit}
              className="mt-4 space-y-3.5"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Citizen Statement / Escalation Justification{" "}
                  <span className="text-rose-600">*</span>
                </label>

                <textarea
                  value={escalationReason}
                  onChange={(e) =>
                    setEscalationReason(e.target.value)
                  }
                  rows="3"
                  placeholder="Detail the civic issue impact, why the current delay is unacceptable, and the relief requested..."
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 text-[11px] text-slate-800 focus:border-blue-700 focus:outline-hidden focus:ring-1 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Supporting Photo / Evidence Document (Optional)
                </label>

                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleEvidenceFile}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2 text-[11px] text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100"
                />

                {escalationEvidence && (
                  <p className="mt-1 text-[10px] text-emerald-700 font-bold">
                    ✓ Evidence document attached
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEscalatingGrievance(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingEscalation}
                  className="rounded-xl bg-rose-700 px-5 py-2 text-[11px] font-bold text-white hover:bg-rose-800 shadow-xs transition"
                >
                  {submittingEscalation
                    ? "Submitting Escalation..."
                    : "Submit to Higher Official"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. OFFICIAL FOOTER */}
      <CivicFooter />
    </div>
  );
}

export default CitizenDashboard;