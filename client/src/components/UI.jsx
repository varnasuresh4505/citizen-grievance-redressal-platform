/* eslint-disable react-refresh/only-export-components */
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  PauseCircle,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import CivicEmblem from "./CivicEmblem";
import CivicHeader from "./CivicHeader";

export function PortalNav({ role = "Citizen" }) {
  return <CivicHeader activeRole={role.toLowerCase()} />;
}

export const statusTone = (status, isOverdue = false) => {
  if (isOverdue || status === "Overdue") {
    return "bg-rose-50 text-rose-800 ring-rose-600/30 border-rose-200";
  }
  switch (status) {
    case "Resolved":
    case "Closed":
      return "bg-emerald-50 text-emerald-800 ring-emerald-600/30 border-emerald-200";
    case "In Progress":
    case "Under Review":
      return "bg-blue-50 text-blue-800 ring-blue-600/30 border-blue-200";
    case "On Hold":
      return "bg-amber-50 text-amber-800 ring-amber-600/30 border-amber-200";
    case "Assigned":
      return "bg-indigo-50 text-indigo-800 ring-indigo-600/30 border-indigo-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-400/30 border-slate-200";
  }
};

export const priorityTone = (priority) => {
  switch (priority) {
    case "Critical":
      return "bg-rose-50 text-rose-700 ring-rose-600/30 border-rose-200";
    case "High":
      return "bg-orange-50 text-orange-700 ring-orange-600/30 border-orange-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 ring-amber-600/30 border-amber-200";
    case "Low":
      return "bg-sky-50 text-sky-700 ring-sky-600/30 border-sky-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-400/30 border-slate-200";
  }
};

export function StatusBadge({ status, isOverdue = false, showDot = true, className = "" }) {
  const overdue = isOverdue || status === "Overdue";

  let dotColor = "bg-slate-400";
  let label = status;

  if (overdue) {
    dotColor = "bg-rose-600 animate-pulse";
    label = "Resolution Overdue";
  } else if (status === "Resolved" || status === "Closed") {
    dotColor = "bg-emerald-600";
    label = status;
  } else if (status === "In Progress" || status === "Under Review") {
    dotColor = "bg-blue-600";
    label = status;
  } else if (status === "On Hold") {
    dotColor = "bg-amber-500";
    label = "On Hold";
  } else if (status === "Assigned") {
    dotColor = "bg-indigo-600";
    label = "Assigned to Officer";
  } else if (status === "Submitted") {
    dotColor = "bg-slate-500";
    label = "Submitted";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset border ${statusTone(
        status,
        overdue
      )} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      <span>{label}</span>
    </span>
  );
}

export function PriorityBadge({ priority, className = "" }) {
  const slaText =
    priority === "Critical"
      ? "3d SLA"
      : priority === "High"
      ? "7d SLA"
      : priority === "Medium"
      ? "10d SLA"
      : priority === "Low"
      ? "15d SLA"
      : "";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${priorityTone(
        priority
      )} ${className}`}
    >
      <span>{priority}</span>
      {slaText && (
        <span className="text-[10px] font-normal opacity-85">({slaText})</span>
      )}
    </span>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

export function Alert({ type = "error", title, children }) {
  let style = "border-rose-200 bg-rose-50 text-rose-800";
  let Icon = AlertOctagon;

  if (type === "success") {
    style = "border-emerald-200 bg-emerald-50 text-emerald-800";
    Icon = CheckCircle2;
  } else if (type === "warning") {
    style = "border-amber-200 bg-amber-50 text-amber-800";
    Icon = AlertTriangle;
  } else if (type === "info") {
    style = "border-blue-200 bg-blue-50 text-blue-800";
    Icon = Info;
  }

  return (
    <div className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-xs font-medium ${style}`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-bold text-sm mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-blue-800">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-3xl text-xs sm:text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CivicFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-[#07172c] text-slate-300 text-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
          <div className="flex items-center gap-3">
            <CivicEmblem className="h-10 w-10 shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">
                Sathyamangalam Municipality Grievance Redressal Portal
              </p>
              <p className="text-[11px] text-slate-400">
                Department of Municipal Administration & Water Supply, Government of Tamil Nadu
              </p>
            </div>
          </div>

          <div className="flex flex-wrap px-25 gap-20 text-[11px] text-slate-400">
            
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-cyan-400 gap-3" />
              <span>commr.sathyamangalam@tn.gov.in</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>Municipal Office Road, Sathyamangalam - 638401</span>
            </span>
          </div>
        </div>

        
      
    </footer>
  );
}
