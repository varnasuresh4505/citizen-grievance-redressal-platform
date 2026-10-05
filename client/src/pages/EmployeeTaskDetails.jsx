import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import Breadcrumb from "../components/Breadcrumb";
import { StatusBadge, PriorityBadge, CivicFooter, Alert } from "../components/UI";
import {
  Wrench,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Upload,
  ArrowRight,
  User,
  X,
} from "lucide-react";

export default function EmployeeTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTask() {
      try {
        const data = await apiRequest("/tasks/my-tasks");
        const item = data.tasks?.find((candidate) => candidate._id === id);
        if (!active) return;
        setTask(item || null);
        setRemarks(item?.remarks || "");
        setEvidence(item?.evidence || []);
        setError(item ? "" : "Task not found or not assigned to you.");
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    }

    void loadTask();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!success) return undefined;
    const timeout = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [success]);

  const attach = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      return setError("Choose an image no larger than 2 MB.");
    }
    const reader = new FileReader();
    reader.onload = () => setEvidence((items) => [...items, reader.result]);
    reader.readAsDataURL(file);
  };

  const update = async (status) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const data = await apiRequest(`/tasks/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, remarks, evidence }),
      });
      setTask((current) => ({
        ...current,
        ...data.task,
        grievance: current.grievance,
      }));
      setRemarks("");
      setEvidence([]);
      setSuccess(`Task marked as ${status.toLowerCase()} successfully.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <CivicHeader activeRole="employee" />
        <main className="flex-1 mx-auto max-w-3xl px-4 py-8">
          {error && <Alert type="error">{error}</Alert>}
        </main>
        <CivicFooter />
      </div>
    );
  }

  const action = {
    Assigned: ["Accepted", "Accept Task"],
    Accepted: ["In Progress", "Start Field Work"],
    "In Progress": ["Completed", "Mark Field Work Completed"],
    "On Hold": ["In Progress", "Resume Field Work"],
  }[task.status];

  const location = [
    task.grievance?.location?.wardName || `Ward ${task.grievance?.location?.wardNumber || ""}`,
    task.grievance?.location?.village,
    task.grievance?.location?.landmark,
    task.grievance?.location?.address,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CivicHeader activeRole="employee" />

      <Breadcrumb
        items={[
          { label: "My Tasks", href: "/employee" },
          { label: task.grievance?.grievanceId || "Task" },
        ]}
        rightContent={<StatusBadge status={task.status} />}
      />

      <main className="flex-1 mx-auto max-w-3xl px-4 py-8 sm:px-6 w-full">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <span className="font-mono text-xs font-bold text-slate-500">
            Docket ID: {task.grievance?.grievanceId}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {task.grievance?.title || "Field Work Order"}
          </h1>
          <p className="mt-1 text-xs text-slate-600 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
            {task.taskDescription || "Perform necessary repairs, inspection, or resolution as required."}
          </p>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="grid gap-3 text-xs sm:grid-cols-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-slate-500 block font-medium">Status</span>
              <span className="font-bold text-slate-900">{task.status}</span>
            </div>

            <div>
              <span className="text-slate-500 block font-medium">Target Deadline</span>
              <span className="font-bold text-slate-900">
                {task.deadline ? new Date(task.deadline).toLocaleDateString("en-IN") : "SLA Target"}
              </span>
            </div>

            <div className="sm:col-span-2 pt-1">
              <span className="text-slate-500 block font-medium">Location</span>
              <span className="font-medium text-slate-800">{location || "Sathyamangalam"}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Field Work Remarks / Inspection Report
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-hidden"
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Describe work completed, components replaced, or reasons if hold is required..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Upload Photographic Proof of Field Work
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={attach}
              className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100"
            />
            {evidence.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {evidence.map((src, i) => (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200" key={src}>
                    <img className="h-20 w-20 object-cover" src={src} alt={`Work proof ${i + 1}`} />
                    <button
                      type="button"
                      onClick={() => setEvidence((items) => items.filter((_, n) => n !== i))}
                      className="absolute right-1 top-1 rounded-full bg-slate-900/80 p-0.5 text-white"
                      aria-label="Remove evidence"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-100">
            {action && (
              <button
                disabled={saving}
                className="rounded-xl bg-[#0b2545] px-5 py-2 text-xs font-bold text-white hover:bg-[#133e6a] transition disabled:opacity-50"
                onClick={() => update(action[0])}
              >
                {saving ? "Saving Status..." : action[1]}
              </button>
            )}

            {["Accepted", "In Progress"].includes(task.status) && (
              <button
                disabled={saving}
                className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition disabled:opacity-50"
                onClick={() => update("On Hold")}
              >
                Place On Hold
              </button>
            )}
          </div>
        </section>
      </main>

      <CivicFooter />
    </div>
  );
}
