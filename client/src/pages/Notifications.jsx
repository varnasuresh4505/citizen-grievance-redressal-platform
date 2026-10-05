import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import Breadcrumb from "../components/Breadcrumb";
import { CivicFooter, Alert } from "../components/UI";
import {
  Bell,
  CheckCircle2,
  Clock,
  Inbox,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "citizen";

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const d = await apiRequest("/notifications");
      setItems(d.notifications || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDashboardPath = () => {
    switch (role) {
      case "higher_official":
        return "/higher-official";
      case "officer":
        return "/officer";
      case "employee":
        return "/employee";
      case "admin":
        return "/admin";
      case "citizen":
      default:
        return "/citizen";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CivicHeader activeRole={role} />

      <Breadcrumb
        items={[
          { label: "Dashboard", href: getDashboardPath() },
          { label: "Notifications & Alerts" },
        ]}
        rightContent={
          <span className="text-xs font-semibold text-slate-500">
            {items.filter((n) => !n.isRead).length} Unread Alerts
          </span>
        }
      />

      <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900">
              Activity Stream
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Official System Notifications
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Status updates, assignments, SLA deadline alerts, and executive directives for your account.
          </p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <div className="py-14 text-center text-xs text-slate-500">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545] mb-2" />
            Loading notification feed...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Inbox className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">No notifications at this time</p>
            <p className="text-xs text-slate-500 mt-1">You will receive notifications when grievances are updated or assigned.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-xs overflow-hidden">
            {items.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition cursor-pointer ${
                  n.isRead ? "bg-white hover:bg-slate-50" : "bg-blue-50/50 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-lg text-xs shrink-0 mt-0.5 ${
                      n.isRead ? "bg-slate-100 text-slate-500" : "bg-blue-900 text-amber-300 font-bold"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm ${n.isRead ? "text-slate-800" : "font-bold text-slate-900"}`}>
                      {n.message}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(n.createdAt)}</span>
                    </p>
                  </div>
                </div>

                {!n.isRead && (
                  <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <CivicFooter />
    </div>
  );
}
