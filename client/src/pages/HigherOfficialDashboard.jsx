import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import { StatusBadge, PriorityBadge, CivicFooter } from "../components/UI";
import {
  ShieldAlert,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertOctagon,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function HigherOfficialDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState({
    openEscalations: 0,
    escalated: 0,
    overdue: 0,
    critical: 0,
    resolved: 0,
  });
  const [recentEscalations, setRecentEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [dashRes, escRes] = await Promise.all([
        apiRequest("/higher-official/dashboard"),
        apiRequest("/higher-official/escalations"),
      ]);
      setStats(dashRes);
      setRecentEscalations(escRes.escalations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. CIVIC HEADER */}
      <CivicHeader activeRole="higher_official" />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">

          {/* Executive Oversight Welcome Banner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    District Collectorate & Municipal Oversight
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Sathyamangalam Jurisdiction
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Municipal Redressal Supervision & Escalations Desk
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl">
                  Supervise civic service delivery across all 16 departments and 27 wards. Review citizen-escalated complaints where statutory SLA deadlines have elapsed, issue binding officer directives, reassign non-performing officers, and enforce civic accountability.
                </p>
              </div>

              <div className="shrink-0 flex gap-2">
                <Link
                  to="/higher-official/escalations"
                  className="rounded-xl bg-[#0b2545] hover:bg-[#133e6a] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition inline-flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Escalation Control Desk ({stats.openEscalations})</span>
                </Link>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* KPI Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="rounded-xl border border-rose-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-800 block">
                Pending Escalations
              </span>
              <p className="mt-1.5 text-2xl font-black text-rose-700">
                {stats.openEscalations}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Awaiting official review</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-900 block">
                Total Overdue Breaches
              </span>
              <p className="mt-1.5 text-2xl font-black text-amber-800">
                {stats.overdue}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Past SLA timeline</span>
            </div>

            <div className="rounded-xl border border-orange-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-orange-900 block">
                Critical Priority Cases
              </span>
              <p className="mt-1.5 text-2xl font-black text-orange-800">
                {stats.critical}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">3-day SLA mandate</span>
            </div>

            <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-blue-900 block">
                Lifetime Escalations
              </span>
              <p className="mt-1.5 text-2xl font-black text-blue-900">
                {stats.escalated}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">All registered escalations</span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-emerald-900 block">
                Resolved Complaints
              </span>
              <p className="mt-1.5 text-2xl font-black text-emerald-800">
                {stats.resolved}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Redressed successfully</span>
            </div>
          </div>

          {/* Citizen Escalations Requiring Review */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Citizen Escalations Requiring Executive Review
                </h3>
                <p className="text-xs text-slate-500">
                  Delayed complaints submitted by Sathyamangalam residents past statutory resolution dates
                </p>
              </div>

              <Link
                to="/higher-official/escalations"
                className="text-xs font-bold text-blue-900 hover:text-blue-950 inline-flex items-center gap-1"
              >
                <span>Full Escalations Registry ({recentEscalations.length})</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545] mb-2" />
                Retrieving escalated cases...
              </div>
            ) : recentEscalations.length === 0 ? (
              <div className="py-12 text-center">
                <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No overdue escalations at this time</p>
                <p className="text-xs text-slate-500 mt-1">All complaints are progressing within SLA deadlines or resolved.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-3 px-3">Docket ID</th>
                      <th className="py-3 px-3">Citizen</th>
                      <th className="py-3 px-3">Department</th>
                      <th className="py-3 px-3">Ward</th>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-3">Delay Status</th>
                      <th className="py-3 px-3">Escalation Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentEscalations.slice(0, 8).map((esc) => {
                      const g = esc.grievance || {};
                      return (
                        <tr key={esc._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {g.grievanceId || "N/A"}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800">
                            {esc.citizen?.name || g.citizen?.name || "Citizen"}
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {g.department?.name || g.category || "Municipal"}
                          </td>
                          <td className="py-3 px-3 font-semibold text-blue-900">
                            Ward {g.location?.wardNumber || "-"}
                          </td>
                          <td className="py-3 px-3">
                            <PriorityBadge priority={g.priority || "Medium"} />
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                              Overdue by {esc.daysOverdueAtEscalation || g.overdueDays || 1}d
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                              {esc.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              to="/higher-official/escalations"
                              className="rounded-lg bg-[#0b2545] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#133e6a] transition"
                            >
                              Intervene
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. CIVIC FOOTER */}
      <CivicFooter />
    </div>
  );
}
