import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import Breadcrumb from "../components/Breadcrumb";
import { StatusBadge, PriorityBadge, CivicFooter } from "../components/UI";
import {
  ShieldAlert,
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
  X,
  AlertTriangle,
  History,
  Send,
} from "lucide-react";

export default function Escalations() {
  const navigate = useNavigate();

  const [escalations, setEscalations] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Intervention form state
  const [actionForm, setActionForm] = useState({
    status: "Under Review",
    officialResponse: "",
    instructionsToOfficer: "",
    reassignOfficerId: "",
    priority: "High",
    revisedDeadline: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [escRes, offRes] = await Promise.all([
        apiRequest("/higher-official/escalations"),
        apiRequest("/higher-official/officers"),
      ]);
      setEscalations(escRes.escalations || []);
      setOfficers(offRes.officers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReviewModal = async (esc) => {
    setSelectedEscalation(esc);
    setActionForm({
      status: esc.status || "Under Review",
      officialResponse: esc.actionTaken || "",
      instructionsToOfficer: esc.instructionsToOfficer || "",
      reassignOfficerId: esc.reassignedOfficer?._id || esc.grievance?.assignedOfficer?._id || "",
      priority: esc.grievance?.priority || "High",
      revisedDeadline: esc.grievance?.dueDate ? esc.grievance.dueDate.slice(0, 10) : "",
    });

    try {
      setLoadingDetail(true);
      const detail = await apiRequest(`/higher-official/escalations/${esc._id}`);
      setSelectedEscalation(detail.escalation);
      setHistory(detail.history || []);
    } catch (err) {
      console.error("Detail error:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateEscalation = async (e) => {
    e.preventDefault();
    if (!selectedEscalation) return;

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const payload = {
        status: actionForm.status,
        officialResponse: actionForm.officialResponse,
        instructionsToOfficer: actionForm.instructionsToOfficer,
        reassignOfficerId: actionForm.reassignOfficerId,
        priority: actionForm.priority,
        revisedDeadline: actionForm.revisedDeadline,
      };

      await apiRequest(`/higher-official/escalations/${selectedEscalation._id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setSuccess("Binding executive directive recorded and communicated to department.");
      setTimeout(() => {
        setSuccess("");
        setSelectedEscalation(null);
        loadData();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredEscalations =
    activeFilter === "all"
      ? escalations
      : escalations.filter((x) => x.status === activeFilter);

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

      {/* 2. BREADCRUMB NAVIGATION */}
      <Breadcrumb
        items={[
          { label: "Executive Console", href: "/higher-official" },
          { label: "Citizen Escalations Registry" },
        ]}
        rightContent={
          <span className="font-semibold text-slate-500 text-xs">
            Total Active Escalations: {escalations.length}
          </span>
        }
      />

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Title & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                Official Case Docket
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Sathyamangalam Municipal Delimitation (27 Wards)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Citizen Escalations Control Desk
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Review cases escalated by citizens when municipal department resolution deadlines have been breached.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            {["all", "Open", "Under Review", "Action Taken", "Closed"].map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeFilter === status
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {status === "all" ? `All (${escalations.length})` : status}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0b2545] mb-3" />
            Loading escalated grievance dossiers...
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredEscalations.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">No escalations matching filter</p>
            <p className="text-xs text-slate-500 mt-1">There are no escalated grievances in the {activeFilter} category.</p>
          </div>
        )}

        {/* Escalations List */}
        {!loading && filteredEscalations.length > 0 && (
          <div className="space-y-4">
            {filteredEscalations.map((esc) => (
              <article
                key={esc._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-xs transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                        {esc.grievance?.grievanceId}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                        <Building2 className="h-3 w-3 text-slate-500" />
                        <span>{esc.grievance?.department?.name || "Department"}</span>
                      </span>

                      <span className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertOctagon className="h-3 w-3 text-rose-700" />
                        <span>Overdue by {esc.currentDaysOverdue || esc.daysOverdueAtEscalation || 1} day{(esc.currentDaysOverdue || esc.daysOverdueAtEscalation || 1) > 1 ? "s" : ""}</span>
                      </span>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          esc.status === "Closed"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : esc.status === "Action Taken"
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : esc.status === "Under Review"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-purple-100 text-purple-900 border border-purple-200"
                        }`}
                      >
                        {esc.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {esc.grievance?.title}
                    </h3>

                    {/* Citizen Delay Statement */}
                    <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-950">
                      <p className="font-bold text-amber-900 mb-0.5">Citizen Escalation Statement:</p>
                      <p className="font-medium whitespace-pre-wrap">{esc.reason}</p>
                    </div>

                    {/* Metadata breakdown */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{esc.citizen?.name} (+91 {esc.citizen?.phone})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>Ward {esc.grievance?.location?.wardNumber} {esc.grievance?.location?.village ? `(${esc.grievance.location.village})` : ""}</span>
                      </span>
                      <span>
                        <strong className="text-slate-700">Officer:</strong>{" "}
                        {esc.reassignedOfficer?.name || esc.grievance?.assignedOfficer?.name || "Unassigned"}
                      </span>
                      <span>
                        <strong className="text-slate-700">SLA Due Date:</strong> {formatDate(esc.grievance?.dueDate)}
                      </span>
                    </div>

                    {/* Instructions issued badge if present */}
                    {esc.instructionsToOfficer && (
                      <div className="text-xs text-amber-950 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-300 flex items-start gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Directive Issued: </span>
                          <span className="italic font-normal">"{esc.instructionsToOfficer}"</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action trigger */}
                  <div className="shrink-0 flex lg:flex-col items-end gap-2">
                    <button
                      onClick={() => openReviewModal(esc)}
                      className="rounded-xl bg-[#0b2545] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#133e6a] transition inline-flex items-center gap-1.5"
                    >
                      <span>Intervene & Review</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 4. INTERVENTION MODAL */}
      {selectedEscalation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Higher Official Executive Review
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  Docket {selectedEscalation.grievance?.grievanceId} — {selectedEscalation.grievance?.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEscalation(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                {success}
              </div>
            )}

            {/* Case Details Cards */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
                <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  Citizen & Locality
                </p>
                <div>
                  <span className="text-slate-500 font-medium">Name: </span>
                  <span className="font-bold text-slate-900">{selectedEscalation.citizen?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Contact: </span>
                  <span className="font-bold text-slate-900">+91 {selectedEscalation.citizen?.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Ward Jurisdiction: </span>
                  <span className="font-bold text-blue-900">
                    Ward {selectedEscalation.grievance?.location?.wardNumber} ({selectedEscalation.grievance?.location?.village || "Sathyamangalam"})
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
                <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  Department & Delay Status
                </p>
                <div>
                  <span className="text-slate-500 font-medium">Department: </span>
                  <span className="font-bold text-slate-900">{selectedEscalation.grievance?.department?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Current Officer: </span>
                  <span className="font-bold text-slate-900">
                    {selectedEscalation.reassignedOfficer?.name || selectedEscalation.grievance?.assignedOfficer?.name || "Unassigned"}
                  </span>
                </div>
                <div className="text-rose-700 font-bold flex items-center gap-1.5 pt-1 border-t border-slate-200">
                  <span>Delay Duration: </span>
                  <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[11px]">
                    {selectedEscalation.currentDaysOverdue || selectedEscalation.daysOverdueAtEscalation || 1} Days Overdue
                  </span>
                </div>
              </div>
            </div>

            {/* Citizen Delay Reason */}
            <div className="mt-3 rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-xs space-y-1">
              <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                Citizen Statement:
              </span>
              <p className="text-slate-900 font-medium whitespace-pre-wrap">
                {selectedEscalation.reason}
              </p>
              {selectedEscalation.evidence && selectedEscalation.evidence.length > 0 && (
                <div className="mt-2 pt-2 border-t border-amber-200/60">
                  <span className="font-bold text-amber-900 block mb-1">Attached Photo Proof:</span>
                  <div className="flex gap-2">
                    {selectedEscalation.evidence.map((img, i) => (
                      <img key={i} src={img} alt="Proof" className="h-20 w-auto rounded border border-slate-200 object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Audit History Timeline */}
            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs max-h-36 overflow-y-auto">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                Case Chronology & History
              </p>
              {history.length === 0 ? (
                <span className="text-slate-400">Loading history...</span>
              ) : (
                <div className="space-y-1.5">
                  {history.map((h, i) => (
                    <div key={i} className="flex justify-between border-b border-slate-200/60 pb-1 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800">{h.action}</span>:{" "}
                        <span className="text-slate-600">{h.remark}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {formatDate(h.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Intervention Form */}
            <form onSubmit={handleUpdateEscalation} className="mt-4 space-y-3.5 pt-3 border-t border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Official Higher Authority Action Form
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Escalation Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Escalation Status
                  </label>
                  <select
                    value={actionForm.status}
                    onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Action Taken">Action Taken</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Priority Override */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adjust Priority
                  </label>
                  <select
                    value={actionForm.priority}
                    onChange={(e) => setActionForm({ ...actionForm, priority: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (Immediate)</option>
                  </select>
                </div>

                {/* Revise Deadline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Revise Resolution Deadline
                  </label>
                  <input
                    type="date"
                    value={actionForm.revisedDeadline}
                    onChange={(e) => setActionForm({ ...actionForm, revisedDeadline: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Reassign Officer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reassign Grievance to Municipal Officer (Optional)
                </label>
                <select
                  value={actionForm.reassignOfficerId}
                  onChange={(e) => setActionForm({ ...actionForm, reassignOfficerId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                >
                  <option value="">-- Keep Current Assigned Officer --</option>
                  {officers.map((off) => (
                    <option key={off._id} value={off._id}>
                      {off.name} ({off.departmentId?.name || "Officer"} - {off.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Direct Instructions to Officer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Binding Directive to Assigned Officer <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={actionForm.instructionsToOfficer}
                  onChange={(e) => setActionForm({ ...actionForm, instructionsToOfficer: e.target.value })}
                  rows="2"
                  placeholder="e.g. Conduct immediate on-site inspection today; submit closure confirmation within 24 hours."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-hidden"
                  required
                />
              </div>

              {/* Official Action Taken Remark */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Public Remark (Visible to Citizen)
                </label>
                <input
                  type="text"
                  value={actionForm.officialResponse}
                  onChange={(e) => setActionForm({ ...actionForm, officialResponse: e.target.value })}
                  placeholder="e.g. Executive directive issued to Department; priority clearance sanctioned."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedEscalation(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl bg-[#0b2545] px-6 py-2 text-xs font-bold text-white hover:bg-[#133e6a] transition shadow-xs"
                >
                  {updating ? "Saving Directive..." : "Issue Executive Directive"}
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
