import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
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
  Filter,
  ShieldCheck,
  ChevronRight,
  AlertOctagon,
} from "lucide-react";

export default function OfficerDashboard() {
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'Assigned', 'In Progress', 'On Hold', 'Overdue', 'Resolved'

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchAssignedGrievances();
  }, []);

  async function fetchAssignedGrievances() {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/officer/grievances");
      setGrievances(data.grievances || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const formatLocation = (location) => {
    if (!location) return "Sathyamangalam";
    if (typeof location === "string") return location;
    return [
      location.wardNumber ? `Ward ${location.wardNumber}` : "",
      location.village,
      location.landmark,
      location.address,
    ].filter(Boolean).join(", ") || "Sathyamangalam";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const assignedCount = grievances.filter((g) => g.status === "Assigned").length;
  const inProgressCount = grievances.filter((g) => g.status === "In Progress").length;
  const onHoldCount = grievances.filter((g) => g.status === "On Hold").length;
  const overdueCount = grievances.filter((g) => g.status === "Overdue" || g.isOverdue).length;
  const resolvedCount = grievances.filter((g) => ["Resolved", "Closed"].includes(g.status)).length;

  const filteredGrievances =
    activeTab === "all"
      ? grievances
      : activeTab === "Overdue"
      ? grievances.filter((g) => g.status === "Overdue" || g.isOverdue)
      : activeTab === "Resolved"
      ? grievances.filter((g) => ["Resolved", "Closed"].includes(g.status))
      : grievances.filter((g) => g.status === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. CIVIC HEADER */}
      <CivicHeader activeRole="officer" />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Department Officer Welcome Strip */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900">
                  Nodal Officer Desk
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {user?.department?.name || user?.designation || "Municipal Administration"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Case Resolution & Redressal Center
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
                Process assigned citizen complaints within statutory SLA deadlines. Coordinate field inspections, document on-hold justifications, and submit closure verification.
              </p>
            </div>

            <div className="shrink-0 text-left md:text-right">
              <span className="text-xs font-bold text-slate-900 block">{user.name}</span>
              <span className="text-[11px] text-slate-500 block font-medium">
                {user.email || user.phone}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Assigned</span>
            <p className="mt-1 text-2xl font-black text-slate-900">{grievances.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-blue-800 block">Assigned / New</span>
            <p className="mt-1 text-2xl font-black text-blue-900">{assignedCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-800 block">In Progress</span>
            <p className="mt-1 text-2xl font-black text-amber-900">{inProgressCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-amber-300 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-900 block">On Hold</span>
            <p className="mt-1 text-2xl font-black text-amber-950">{onHoldCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-rose-300 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-800 block">SLA Overdue</span>
            <p className="mt-1 text-2xl font-black text-rose-700">{overdueCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-emerald-800 block">Resolved Cases</span>
            <p className="mt-1 text-2xl font-black text-emerald-800">{resolvedCount}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-bold mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Assigned ({grievances.length})
          </button>

          <button
            onClick={() => setActiveTab("Assigned")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "Assigned" ? "bg-white text-blue-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            New ({assignedCount})
          </button>

          <button
            onClick={() => setActiveTab("In Progress")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "In Progress" ? "bg-white text-amber-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            In Progress ({inProgressCount})
          </button>

          <button
            onClick={() => setActiveTab("On Hold")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "On Hold" ? "bg-white text-amber-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            On Hold ({onHoldCount})
          </button>

          <button
            onClick={() => setActiveTab("Overdue")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "Overdue" ? "bg-rose-700 text-white shadow-2xs" : "text-rose-700 hover:bg-rose-100/50"
            }`}
          >
            <span>Overdue</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "Overdue" ? "bg-white text-rose-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {overdueCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("Resolved")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "Resolved" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545] mb-3" />
            Loading assigned grievances from municipal database...
          </div>
        )}

        {/* Empty */}
        {!loading && filteredGrievances.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">No grievances in this category</p>
            <p className="text-xs text-slate-500 mt-1">There are no grievances currently matching the selected status filter.</p>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && filteredGrievances.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrievances.map((g) => {
              const isOverdue = g.status === "Overdue" || g.isOverdue;
              const isOnHold = g.status === "On Hold";
              const isResolved = ["Resolved", "Closed"].includes(g.status);

              return (
                <div
                  key={g._id}
                  className={`rounded-xl border bg-white p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between ${
                    isOverdue ? "border-rose-300 ring-1 ring-rose-200" : isOnHold ? "border-amber-300" : "border-slate-200"
                  }`}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {g.grievanceId}
                      </span>

                      <StatusBadge status={g.status} isOverdue={isOverdue} />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                      {g.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {g.description}
                    </p>

                    {/* OVERDUE BADGE */}
                    {isOverdue && (
                      <div className="mt-2.5 text-[11px] font-bold text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200 flex items-center gap-1.5">
                        <AlertOctagon className="h-3.5 w-3.5 text-rose-700 shrink-0" />
                        <span>Overdue by {g.overdueDays || 1} day{(g.overdueDays || 1) > 1 ? "s" : ""} past SLA</span>
                      </div>
                    )}

                    {/* ON HOLD REASON */}
                    {isOnHold && (
                      <div className="mt-2.5 text-[11px] font-medium text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <strong className="text-amber-800">Hold Reason: </strong> {g.onHoldReason}
                      </div>
                    )}

                    {/* ESCALATION DIRECTIVE BANNER */}
                    {g.escalation?.instructionsToOfficer && (
                      <div className="mt-2.5 text-[11px] font-bold text-amber-950 bg-amber-50 p-2 rounded-lg border border-amber-300 flex items-start gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span>Higher Official Directive: </span>
                          <span className="italic font-normal">"{g.escalation.instructionsToOfficer}"</span>
                        </div>
                      </div>
                    )}

                    {/* METADATA */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{formatLocation(g.location)}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{g.citizen?.name} ({g.citizen?.phone})</span>
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <PriorityBadge priority={g.priority} />
                        <span className={`text-[11px] ${isOverdue ? "text-rose-700 font-bold" : "text-slate-500"}`}>
                          Target: {formatDate(g.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(g.createdAt)}</span>
                    </span>

                    <button
                      onClick={() => navigate(`/officer/grievance/${g._id}`)}
                      className="rounded-lg bg-[#0b2545] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#133e6a] transition inline-flex items-center gap-1"
                    >
                      <span>Manage Case</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 3. CIVIC FOOTER */}
      <CivicFooter />
    </div>
  );
}
