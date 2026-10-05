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
  Info,
  X,
  Upload,
  ArrowRight,
  ShieldCheck,
  History,
} from "lucide-react";

export default function GrievanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Escalation modal state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [escalationEvidence, setEscalationEvidence] = useState("");
  const [submittingEscalation, setSubmittingEscalation] = useState(false);
  const [escalationSuccess, setEscalationSuccess] = useState("");
  const [escalationError, setEscalationError] = useState("");

  const fetchGrievance = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest(`/grievances/${id}`);
      setGrievance(data.grievance);
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievance();
  }, [id]);

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

  const handleEvidenceFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEscalationEvidence(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEscalationSubmit = async (e) => {
    e.preventDefault();
    if (!escalationReason.trim()) {
      setEscalationError("Please enter your reason for escalating this overdue grievance.");
      return;
    }

    try {
      setSubmittingEscalation(true);
      setEscalationError("");

      await apiRequest("/escalations", {
        method: "POST",
        body: JSON.stringify({
          grievanceId: grievance._id,
          reason: escalationReason.trim(),
          evidence: escalationEvidence ? [escalationEvidence] : [],
        }),
      });

      setEscalationSuccess("Grievance escalated to Higher Official successfully!");
      setTimeout(() => {
        setShowEscalateModal(false);
        fetchGrievance();
      }, 1500);
    } catch (err) {
      setEscalationError(err.message);
    } finally {
      setSubmittingEscalation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <CivicHeader activeRole="citizen" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545]" />
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Retrieving case dossier and audit history...
            </p>
          </div>
        </div>
        <CivicFooter />
      </div>
    );
  }

  if (error || !grievance) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <CivicHeader activeRole="citizen" />
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow-xs border border-rose-200 text-center">
            <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900 mb-1">Grievance Record Not Accessible</p>
            <p className="text-xs text-slate-600 mb-4">{error || "The requested grievance does not exist or has been archived."}</p>
            <button
              onClick={() => navigate("/citizen")}
              className="rounded-xl bg-[#0b2545] px-4 py-2 text-xs font-bold text-white hover:bg-[#133e6a] transition"
            >
              Return to Citizen Portal
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
      <CivicHeader activeRole="citizen" />

      {/* 2. BREADCRUMB NAVIGATION */}
      <Breadcrumb
        items={[
          { label: "Citizen Portal", href: "/citizen" },
          { label: "Grievances", href: "/citizen" },
          { label: grievance.grievanceId },
        ]}
        rightContent={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200">
              {grievance.grievanceId}
            </span>
            <StatusBadge status={grievance.status} isOverdue={isOverdue} />
          </div>
        }
      />

      {/* 3. MAIN DOSSIER WORKSPACE */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* OVERDUE ACTION BANNER */}
          

          {/* ON-HOLD BANNER */}
          {isOnHold && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">Grievance Placed On Administrative Hold</p>
                <p className="mt-1 font-medium text-amber-800">
                  {grievance.onHoldReason || "Temporarily paused while requiring external verification or specialized equipment."}
                </p>
              </div>
            </div>
          )}

          

          {/* MAIN GRIEVANCE CASE DOSSIER */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                  {grievance.grievanceId}
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
                  <Building2 className="h-3 w-3 text-slate-500" />
                  <span>{grievance.department?.name || grievance.category}</span>
                </span>

                <PriorityBadge priority={grievance.priority} />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {grievance.title}
              </h2>

              <div className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap">
                {grievance.description}
              </div>
            </div>

            {/* LOCATION & ADMINISTRATIVE METADATA GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-2.5">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <MapPin className="h-3.5 w-3.5 text-blue-800" />
                  <span>Geographic Jurisdiction</span>
                </p>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Locality / Village:</span>
                  <span className="font-bold text-slate-800">{grievance.location?.village || "Sathyamangalam"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Ward Jurisdiction:</span>
                  <span className="font-bold text-blue-900">Ward {grievance.location?.wardNumber}</span>
                </div>
                {grievance.location?.landmark && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Landmark:</span>
                    <span className="font-bold text-slate-800">{grievance.location.landmark}</span>
                  </div>
                )}
                <div className="pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 block mb-0.5 font-medium">Street Address:</span>
                  <span className="font-medium text-slate-800">{grievance.location?.address}</span>
                </div>
              </div>

              {/* Department & Officer Details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-2.5">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <Building2 className="h-3.5 w-3.5 text-blue-800" />
                  <span>Administrative Accountability</span>
                </p>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Nodal Department:</span>
                  <span className="font-bold text-slate-800">{grievance.department?.name || grievance.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Assigned Officer:</span>
                  <span className="font-bold text-slate-900">
                    {grievance.assignedOfficer?.name || "Pending Nodal Assignment"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Registration Date:</span>
                  <span className="font-medium text-slate-800">{formatDate(grievance.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Target Resolution Date:</span>
                  <span className={`font-bold ${isOverdue ? "text-rose-700" : "text-emerald-700"}`}>
                    {formatDate(grievance.dueDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence photos if available */}
            {grievance.evidence && grievance.evidence.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                  Supporting Photo Proof & Attached Records
                </p>
                <div className="flex flex-wrap gap-3">
                  {grievance.evidence.map((img, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 max-w-xs shadow-2xs">
                      {img.startsWith("data:image") ? (
                        <img src={img} alt="Evidence" className="h-44 w-auto object-cover" />
                      ) : (
                        <div className="p-4 bg-slate-100 text-xs font-semibold text-slate-700">
                          Evidence Document #{i + 1}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution outcome if resolved */}
            {isResolved && grievance.resolution && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs">
                <p className="font-bold text-emerald-900 text-sm flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  <span>Official Resolution Summary</span>
                </p>
                <p className="text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                  {grievance.resolution}
                </p>
                {grievance.resolvedAt && (
                  <p className="text-[11px] text-emerald-800 font-semibold mt-2.5 pt-2 border-t border-emerald-200">
                    Certified Closed on {formatDate(grievance.resolvedAt)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* AUDIT HISTORY TIMELINE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-blue-800" />
              <span>Audit Trail & Official Chronology</span>
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400">No activity logged in audit trail yet.</p>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pl-5">
                {history.map((h, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#0b2545] shadow-xs" />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{h.action}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{formatDate(h.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-snug">{h.remark}</p>
                      {h.updatedBy && (
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          Logged by: <strong className="text-slate-800">{h.updatedBy.name}</strong> ({h.actorRole || h.updatedBy.role})
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. ESCALATION MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-rose-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                  Official Overdue Escalation
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Escalate Case to Higher Official
                </h3>
              </div>
              <button
                onClick={() => setShowEscalateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {escalationError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                {escalationError}
              </div>
            )}

            {escalationSuccess && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                {escalationSuccess}
              </div>
            )}

            <form onSubmit={handleEscalationSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Citizen Escalation Justification <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  rows="3"
                  placeholder="Detail why the delay is impacting residents and the administrative remedy requested..."
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-blue-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supporting Photo Proof / Document (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleEvidenceFile}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100"
                />
                {escalationEvidence && (
                  <p className="mt-1 text-[11px] text-emerald-700 font-bold">✓ Evidence attached</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingEscalation}
                  className="rounded-xl bg-rose-700 px-5 py-2 text-xs font-bold text-white hover:bg-rose-800 shadow-xs transition"
                >
                  {submittingEscalation ? "Submitting Escalation..." : "Submit to Higher Official"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CIVIC FOOTER */}
      <CivicFooter />
    </div>
  );
}
