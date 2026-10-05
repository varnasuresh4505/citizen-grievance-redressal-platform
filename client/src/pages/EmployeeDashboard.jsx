import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import { StatusBadge, PriorityBadge, CivicFooter, Alert } from "../components/UI";
import {
  Wrench,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Inbox,
} from "lucide-react";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    apiRequest("/tasks/my-tasks")
      .then((d) => setTasks(d.tasks || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CivicHeader activeRole="employee" />

      <main className="flex-1 mx-auto max-w-6xl px-4 py-8 sm:px-6 w-full">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900">
              Field Staff Portal
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {user?.department?.name || "Municipal Service"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Assigned Field Work Tasks
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Accept dispatches from department officers, perform on-site inspections, log photo proofs, and report completion.
          </p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <div className="py-14 text-center text-xs text-slate-500">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545] mb-2" />
            Loading assigned field tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Inbox className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">No field tasks assigned currently</p>
            <p className="text-xs text-slate-500 mt-1">Dispatches from your nodal officer will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.map((t) => (
              <article
                key={t._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {t.grievance?.grievanceId || "Docket"}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                        {t.grievance?.title || "Field Work Order"}
                      </h3>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3 leading-relaxed">
                    {t.taskDescription || t.grievance?.description || "Perform necessary repairs and inspection."}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        Ward {t.grievance?.location?.wardNumber}
                        {t.grievance?.location?.village ? `, ${t.grievance.location.village}` : ""}
                        {t.grievance?.location?.landmark ? ` (${t.grievance.location.landmark})` : ""}
                      </span>
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <PriorityBadge priority={t.grievance?.priority || "Medium"} />
                      <span className="text-[11px] text-slate-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Deadline: {t.deadline ? new Date(t.deadline).toLocaleDateString("en-IN") : "SLA Target"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <Link
                    to={`/employee/tasks/${t._id}`}
                    className="rounded-lg bg-[#0b2545] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#133e6a] transition shadow-2xs inline-flex items-center gap-1"
                  >
                    <span>Execute Task</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <CivicFooter />
    </div>
  );
}
