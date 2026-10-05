import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import Breadcrumb from "../components/Breadcrumb";
import { StatusBadge, PriorityBadge, CivicFooter, Alert } from "../components/UI";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function AdminGrievanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchGrievanceDetails();
  }, [id]);

  async function fetchGrievanceDetails() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(`/admin/grievances/${id}`);
      setGrievance(data.grievance);

      const officerData = await apiRequest(
        `/admin/officers?department=${data.grievance.department?._id || data.grievance.department}`
      );
      setOfficers(officerData.officers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedOfficer) {
      setError("Please select an officer from the list.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      const data = await apiRequest(`/admin/grievances/${id}/assign`, {
        method: "PUT",
        body: JSON.stringify({ officerId: selectedOfficer }),
      });

      setGrievance(data.grievance);
      setSuccess("Officer assigned to grievance successfully.");
      setSelectedOfficer("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <CivicHeader activeRole="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-xs text-slate-500">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545] mb-2" />
            Loading grievance details...
          </div>
        </div>
        <CivicFooter />
      </div>
    );
  }

  if (error && !grievance) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <CivicHeader activeRole="admin" />
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow-xs border border-rose-200 text-center">
            <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900 mb-1">Grievance Not Found</p>
            <p className="text-xs text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/admin/grievances")}
              className="rounded-xl bg-[#0b2545] px-4 py-2 text-xs font-bold text-white hover:bg-[#133e6a] transition"
            >
              Return to Grievances Ledger
            </button>
          </div>
        </div>
        <CivicFooter />
      </div>
    );
  }

  if (!grievance) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CivicHeader activeRole="admin" />

      <Breadcrumb
        items={[
          { label: "Admin Console", href: "/admin" },
          { label: "All Grievances", href: "/admin/grievances" },
          { label: grievance.grievanceId || "Docket" },
        ]}
        rightContent={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              {grievance.grievanceId}
            </span>
            <StatusBadge status={grievance.status} />
          </div>
        }
      />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900">
            System Administration
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Grievance Allocation & Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review grievance docket details and assign or reassign departmental officers.
          </p>
        </div>

        {success && <Alert type="success">{success}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Case Dossier */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    ID: {grievance.grievanceId || grievance._id}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    {grievance.title}
                  </h2>
                </div>
                <PriorityBadge priority={grievance.priority} />
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap">
                  {grievance.description}
                </p>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Department / Category:</span>
                  <span className="font-bold text-slate-900">{grievance.department?.name || grievance.category}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Jurisdiction Ward:</span>
                  <span className="font-bold text-blue-900">Ward {grievance.location?.wardNumber}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Submission Date:</span>
                  <span className="font-medium text-slate-800">{new Date(grievance.createdAt).toLocaleDateString("en-IN")}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Expected Due Date:</span>
                  <span className="font-bold text-slate-800">{new Date(grievance.dueDate).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Citizen Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
                Registered Citizen Information
              </h3>
              {grievance.citizen ? (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-500 block font-medium">Name:</span>
                    <span className="font-bold text-slate-900">{grievance.citizen.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Mobile:</span>
                    <span className="font-bold text-slate-900">+91 {grievance.citizen.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Email:</span>
                    <span className="font-medium text-slate-800 truncate block">{grievance.citizen.email}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Citizen information not available.</p>
              )}
            </div>
          </div>

          {/* Right Side: Assignment Box */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                Officer Assignment
              </h3>

              {grievance.assignedOfficer ? (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    Currently Assigned Nodal Officer
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {grievance.assignedOfficer.name}
                  </p>
                  <p className="text-slate-600 truncate">{grievance.assignedOfficer.email}</p>
                  <p className="text-slate-600">{grievance.assignedOfficer.phone}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block font-bold text-slate-700">
                    Select Department Officer
                  </label>
                  <select
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 bg-white"
                  >
                    <option value="">-- Choose an Officer --</option>
                    {officers.map((off) => (
                      <option key={off._id} value={off._id}>
                        {off.name} ({off.email})
                      </option>
                    ))}
                  </select>

                  {officers.length === 0 && (
                    <p className="text-amber-800 text-[11px]">
                      No active officers registered for this department.
                    </p>
                  )}

                  <button
                    onClick={handleAssign}
                    disabled={assigning || officers.length === 0}
                    className="w-full rounded-xl bg-[#0b2545] py-2.5 text-xs font-bold text-white hover:bg-[#133e6a] transition shadow-xs disabled:opacity-50"
                  >
                    {assigning ? "Assigning..." : "Assign Nodal Officer"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <CivicFooter />
    </div>
  );
}
