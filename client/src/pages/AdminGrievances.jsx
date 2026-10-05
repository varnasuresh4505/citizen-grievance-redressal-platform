import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import Breadcrumb from "../components/Breadcrumb";
import { StatusBadge, PriorityBadge, CivicFooter, Alert } from "../components/UI";
import {
  FileText,
  Building2,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";

function AdminGrievances() {
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatLocation = (location) => {
    if (typeof location === "string") return location;
    return [
      location?.wardName || (location?.wardNumber ? `Ward ${location.wardNumber}` : ""),
      location?.village,
      location?.area,
      location?.landmark,
      location?.address,
    ]
      .filter(Boolean)
      .join(", ") || "Sathyamangalam";
  };

  useEffect(() => {
    (async () => {
      try {
        const d = await apiRequest("/admin/grievances");
        setGrievances(d.grievances || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CivicHeader activeRole="admin" />

      <Breadcrumb
        items={[
          { label: "Admin Console", href: "/admin" },
          { label: "All Grievances" },
        ]}
        rightContent={
          <span className="text-xs font-semibold text-slate-500">
            Total Grievances: {grievances.length}
          </span>
        }
      />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900">
            Municipal Registry
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Grievances Master Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View all citizen submissions across Sathyamangalam's 16 departments and 27 wards.
          </p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <div className="py-14 text-center text-xs text-slate-500">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545] mb-2" />
            Loading grievances registry...
          </div>
        ) : grievances.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">No grievances registered yet</p>
            <p className="text-xs text-slate-500 mt-1">New citizen submissions will appear here automatically.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600 lg:grid">
              <span>Grievance Subject & ID</span>
              <span>Citizen & Department</span>
              <span>Location / Ward</span>
              <span>Priority & Status</span>
              <span className="sr-only">Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {grievances.map((g) => (
                <article
                  key={g._id}
                  className="grid gap-4 p-5 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-center lg:px-6 hover:bg-slate-50/80 transition"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {g.grievanceId || "Docket"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(g.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 text-sm leading-snug">
                      {g.title}
                    </p>

                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                      {g.description}
                    </p>
                  </div>

                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">
                      {g.citizen?.name || "Citizen"}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {g.department?.name || g.category}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 truncate">
                    {formatLocation(g.location)}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={g.priority} />
                    <StatusBadge status={g.status} isOverdue={g.isOverdue} />
                  </div>

                  <button
                    onClick={() => navigate(`/admin/grievances/${g._id}`)}
                    className="rounded-lg bg-[#0b2545] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#133e6a] transition shadow-2xs self-start lg:self-center"
                  >
                    Manage
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <CivicFooter />
    </div>
  );
}

export default AdminGrievances;
