import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import CivicHeader from "../components/CivicHeader";
import Breadcrumb from "../components/Breadcrumb";
import { CivicFooter } from "../components/UI";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  User,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  X,
  Sparkles,
} from "lucide-react";

// Official 27 Sathyamangalam Wards & Delimitation location clues
const WARD_CLUES = {
  1: "Kottuveerampalayam Rural, Nadar Colony, Bhavani River, Chikkarasampalayam Village",
  2: "Periyakulam, Kottuveerampalayam Rural, Thippusulthan Main Road, Bakkiayalakshmi Nagar",
  3: "Varadhampalayam Rural Road, Madeswarappan Kovil Road, Periyakulam Road, Bathirakaliyamman Kovil East Street",
  4: "Dhandumariyamman West Street, Suseendharan Layout, Bathirakaliyamman Kovil East Street",
  5: "Forest Depot North Street, Puliyangombai Road, Madeswarappan Kovil Road",
  6: "Thandumariyamman Kovil Streets, Telephone Exchange Office, Forest Depot North Street",
  7: "Thandumariyamman Kovil West Street, Telephone Exchange Office",
  8: "R.C. Church, Thiruneelakandar Mandapam Street, Thandumariyamman Kovil Streets",
  9: "Puliyankombai Road, Weekly Market, Annaiyan East Street",
  10: "Puliyankombai Road, Weekly Market, Annaiyan East Street",
  11: "Government Boys Higher Secondary School, Athani Road, Bhavani River, Malaiyadipudhur",
  12: "Thippusulthan Road, Municipal Elementary School, R.C. Church, North Pet Road",
  13: "Thippusulthan Road, Vengatachalam Big Street, North Pet Road, Bathirakaliyamman Kovil West Street",
  14: "Bathirakaliyamman East Street, Mariyamman Kovil Street, North Pet Road",
  15: "Vengatachalam Small Street, Bazaar Street, North Pet Road",
  16: "Thippusulthan Road, Bazaar Street, Bathirakaliyamman Kovil Street, Soundamman Kovil Street",
  17: "Bakkiayalakshmi Nagar, Bathirakaliyamman Kovil New/West Streets, Soundamman Kovil Street",
  18: "Thippusulthan Road, Bazaar Street, Old Post Office Road, Iyyappan Nagar",
  19: "Sowdamman Kovil Street, Bhavani River, Old Post Office South Street, Kottuveerampalayam Rural",
  20: "Bazaar Street, Bhavani River, Meenachi Amman Kovil West Street, Muniyappan Kovil Street",
  21: "Bazaar Street, Bhavani River, Old Post Office South Street, Mathimarathurai Street",
  22: "Sunnambukara Lane, Bhavani River, Cutchery Street, Pillaiyar Kovil Street",
  23: "Bhavani River, Ariyappampalayam Village boundary, Thelkaradu Streets, Rangasamuthiram lanes",
  24: "Anna Nagar/Thelkaradu Colony, Govindarajapuram Harijan Colony, Mysore Trunk Road",
  25: "Thelkaradu Colony, Koothanur Road, Mysore Trunk Road",
  26: "Mettupalayam Road, Parisal Thurai Street, Konamoolai Village",
  27: "Thirunagar Colony, Gobi Main Road, Mysore Trunk Road, Mettupalayam Road",
};

// Default Villages & Ward mappings
const VILLAGE_WARD_MAP = {
  "Sathyamangalam Town": [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22],
  "Kottuveerampalayam": [1, 2, 19],
  "Varadhampalayam": [3],
  "Chikkarasampalayam": [1],
  "Ariyappampalayam": [23, 24, 25],
  "Konamoolai": [26, 27],
  "All Sathyamangalam Wards (1-27)": Array.from({ length: 27 }, (_, i) => i + 1),
};

const PRIORITY_DAYS = {
  Low: 15,
  Medium: 10,
  High: 7,
  Critical: 3,
};

export default function SubmitGrievance() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [departments, setDepartments] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState("Sathyamangalam Town");
  const [selectedWard, setSelectedWard] = useState(4);
  const [landmark, setLandmark] = useState("");
  const [address, setAddress] = useState(user.address || "");
  const [departmentId, setDepartmentId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [gender, setGender] = useState(user.gender || "prefer_not_to_say");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  // Load official departments
  useEffect(() => {
    apiRequest("/departments")
      .then((res) => {
        setDepartments(res.departments || []);
        if (res.departments?.length > 0) {
          setDepartmentId(res.departments[0]._id);
        }
      })
      .catch((err) => {
        setError("Failed to load departments: " + err.message);
      });
  }, []);

  // Update ward when village changes
  const handleVillageChange = (e) => {
    const v = e.target.value;
    setSelectedVillage(v);
    const availableWards = VILLAGE_WARD_MAP[v] || [];
    if (availableWards.length > 0) {
      setSelectedWard(availableWards[0]);
    }
  };

  // Calculate live expected resolution date
  const calculateExpectedDate = () => {
    const days = PRIORITY_DAYS[priority] || 10;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Evidence file upload handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEvidence([reader.result]);
    };
    reader.readAsDataURL(file);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Please provide a grievance title and detailed description.");
      return;
    }

    if (!address.trim() && !landmark.trim()) {
      setError("Please specify the address or landmark of the issue.");
      return;
    }

    try {
      setLoading(true);

      const chosenDept = departments.find((d) => d._id === departmentId);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: chosenDept ? chosenDept.name : "Other Government Services",
        department: departmentId,
        priority,
        location: {
          village: selectedVillage,
          wardNumber: Number(selectedWard),
          landmark: landmark.trim(),
          address: address.trim(),
          area: selectedVillage,
        },
        evidence,
      };

      const res = await apiRequest("/grievances", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSubmittedData({
        grievanceId: res.grievance.grievanceId,
        department: res.grievance.department?.name || chosenDept?.name,
        status: res.grievance.status,
        expectedResolutionDate: calculateExpectedDate(),
        id: res.grievance._id,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableWards = VILLAGE_WARD_MAP[selectedVillage] || [];
  const activeClues = WARD_CLUES[selectedWard] || "";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. CIVIC HEADER */}
      <CivicHeader activeRole="citizen" />

      {/* 2. BREADCRUMB NAVIGATION (Replaces raw back button) */}
      <Breadcrumb
        items={[
          { label: "Citizen Portal", href: "/citizen" },
          { label: "File Grievance" },
        ]}
        
      />

      {/* 3. MAIN FORM */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9 shadow-xs">
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2 mb-1.5">
                
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Public Grievance Registration
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Submit Citizen Grievance
              </h2>
              <p className="mt-1 text-[13px] text-slate-600">
                Official complaint will be auto-routed to the designated Sathyamangalam municipal department. It is guaranteed a time-bound SLA resolution and higher official escalation eligibility if overdue.
              </p>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">

              
              {/* 2. GRIEVANCE LOCATION SECTION */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-800" />
                  <span>Grievance Jurisdiction (Sathyamangalam, Erode District)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Village / Town Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Village / Locality <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={selectedVillage}
                      onChange={handleVillageChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                      required
                    >
                      {Object.keys(VILLAGE_WARD_MAP).map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    
                  </div>

                  {/* Ward Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ward Number <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                      required
                    >
                      {availableWards.map((w) => (
                        <option key={w} value={w}>
                          Ward {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delimitation Location Clues for selected ward */}
                {activeClues && (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-blue-900 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-blue-700" />
                        <span>Official Delimitation Clues for Ward {selectedWard}:</span>
                      </span>
                      
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {activeClues.split(", ").map((clue, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setLandmark(clue)}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 text-[11px] hover:bg-blue-50 hover:border-blue-400 hover:text-blue-900 transition"
                        >
                          + {clue}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Landmark */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Landmark / Reference Point
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  {/* Specific Address */}
                  
                </div>
              </div>

              {/* 3. GOVERNMENT DEPARTMENT & RESOLUTION TIMELINE */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-800" />
                  <span>Department Routing & SLA Timeline</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Government Department <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                      required
                    >
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                   
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Priority Level & Guaranteed Resolution SLA
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                    >
                      <option value="Low">Low Priority (Allowed: 15 days)</option>
                      <option value="Medium">Medium Priority (Allowed: 10 days)</option>
                      <option value="High">High Priority (Allowed: 7 days)</option>
                      <option value="Critical">Critical Priority (Allowed: 3 days)</option>
                    </select>

                    <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-[11px] text-emerald-800 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Expected Resolution Target:</span>
                      </span>
                      <span className="font-bold underline">{calculateExpectedDate()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. GRIEVANCE DETAILS & EVIDENCE */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-800" />
                  <span>4. Grievance Description & Evidence</span>
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Grievance Subject / Title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Detailed Grievance Description <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    placeholder="Describe the issue clearly.."
                    required
                    className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed text-slate-900"
                  />
                </div>

                {/* Upload Photo Proof */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Upload Photo Proof / Supporting Evidence (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="text-[12px] text-slate-500 mt-1">
                    Upload a photograph showing the damaged road, street light, garbage heap, or water leakage for accelerated inspection.
                  </p>
                  {evidence.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Evidence attached</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEvidence([])}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/citizen")}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#0b2545] px-7 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#133e6a] transition"
                >
                  {loading ? "Submitting to Municipal Ledger..." : "Register Grievance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* 4. SUCCESS REGISTRATION MODAL */}
      {submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl border border-slate-200 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              Grievance Registered Successfully
            </h3>

            <p className="text-xs text-slate-500 mt-1 mb-5">
              Your complaint has been assigned to the department officer under official Sathyamangalam municipal tracking.
            </p>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-left space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Grievance Docket ID:</span>
                <span className="font-mono font-bold text-blue-900">{submittedData.grievanceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Concerned Department:</span>
                <span className="font-bold text-slate-900">{submittedData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Initial Status:</span>
                <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {submittedData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Expected Resolution:</span>
                <span className="font-bold text-emerald-800">{submittedData.expectedResolutionDate}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(`/citizen/grievance/${submittedData.id}`)}
                className="w-full rounded-xl bg-[#0b2545] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#133e6a] transition"
              >
                View Case Dossier & Live Timeline
              </button>

              <button
                onClick={() => navigate("/citizen")}
                className="w-full rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Return to Citizen Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CIVIC FOOTER */}
      <CivicFooter />
    </div>
  );
}
