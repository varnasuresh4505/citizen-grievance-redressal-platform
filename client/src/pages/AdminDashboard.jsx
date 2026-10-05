import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import { CivicFooter, Alert } from "../components/UI";
import {
  FileText,
  Clock,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest("/admin/dashboard");
        setStats({
          total: data.total || 0,
          pending: data.pending || 0,
          assigned: data.assigned || 0,
          inProgress: data.inProgress || 0,
          resolved: data.resolved || 0,
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const metrics = [
    { label: "Total Registered", value: stats.total, color: "text-slate-900", border: "border-slate-200" },
    { label: "Pending Assignment", value: stats.pending, color: "text-slate-700", border: "border-slate-200" },
    { label: "Assigned to Officers", value: stats.assigned, color: "text-blue-900", border: "border-blue-200" },
    { label: "In Active Progress", value: stats.inProgress, color: "text-amber-800", border: "border-amber-200" },
    { label: "Resolved & Closed", value: stats.resolved, color: "text-emerald-800", border: "border-emerald-200" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CivicHeader activeRole="admin" />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900">
              System Administration
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Municipal Redressal Command Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Monitor civic service requests across 27 wards and maintain accountability throughout Sathyamangalam.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/grievances")}
            className="rounded-xl bg-[#0b2545] px-4 py-2 text-xs font-bold text-white hover:bg-[#133e6a] transition shadow-xs inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Manage All Grievances</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <div className="py-14 text-center text-xs text-slate-500">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545] mb-2" />
            Loading administration statistics...
          </div>
        ) : (
          <>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
              {metrics.map((m) => (
                <div key={m.label} className={`rounded-xl border ${m.border} bg-white p-4 shadow-2xs`}>
                  <p className="text-[11px] font-semibold text-slate-500">{m.label}</p>
                  <p className={`mt-2 text-2xl font-black tracking-tight ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Grievance Registry & Officer Assignment
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Review citizen filings, assign nodal officers, and verify resolution closures.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/admin/grievances")}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Open Full Registry
                </button>
              </div>

              <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <UserCheck className="h-4 w-4 text-blue-900" />
                    <p className="font-bold text-slate-900">Assign Ownership</p>
                  </div>
                  <p className="text-slate-600">
                    Route unassigned complaints directly to the appropriate department officer.
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock className="h-4 w-4 text-amber-700" />
                    <p className="font-bold text-slate-900">Monitor SLAs</p>
                  </div>
                  <p className="text-slate-600">
                    Keep live visibility on overdue complaints and track statutory resolution deadlines.
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    <p className="font-bold text-slate-900">Verify Closure</p>
                  </div>
                  <p className="text-slate-600">
                    Review resolution summaries and maintain a transparent municipal public record.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <CivicFooter />
    </div>
  );
}

export default AdminDashboard;
