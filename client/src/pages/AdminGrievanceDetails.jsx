import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api";

function AdminGrievanceDetails() {
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
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get all grievances
      const grievanceData = await apiRequest("/admin/grievances");

      const currentGrievance = grievanceData.grievances.find(
        (item) => item._id === id
      );

      if (!currentGrievance) {
        throw new Error("Grievance not found");
      }

      setGrievance(currentGrievance);

      // Get officers
      const officerData = await apiRequest("/admin/officers");

      setOfficers(officerData.officers || []);
    } catch (error) {
      console.error("Admin grievance details error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedOfficer) {
      setError("Please select an officer");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      const data = await apiRequest(
        `/admin/grievances/${id}/assign`,
        {
          method: "PUT",
          body: JSON.stringify({
            officerId: selectedOfficer,
          }),
        }
      );

      setGrievance(data.grievance);

      setSuccess("Officer assigned successfully!");

      setSelectedOfficer("");
    } catch (error) {
      console.error("Assign officer error:", error);
      setError(error.message);
    } finally {
      setAssigning(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Resolved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "In Progress") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "Assigned") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading grievance details...
        </p>
      </div>
    );
  }

  if (error && !grievance) {
    return (
      <div className="min-h-screen bg-gray-100">

        <nav className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate("/admin/grievances")}
              className="text-blue-600 font-semibold hover:underline"
            >
              ← Back to Grievances
            </button>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-10">

          <div className="bg-red-100 text-red-700 p-5 rounded-lg">
            {error}
          </div>

        </main>

      </div>
    );
  }

  if (!grievance) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          <button
            onClick={() => navigate("/admin/grievances")}
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Back to Grievances
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>

        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Grievance
          </h1>

          <p className="text-gray-500 mt-1">
            Review grievance details and assign an officer
          </p>
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* GRIEVANCE DETAILS */}
          <div className="lg:col-span-2">

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <div className="flex justify-between items-start gap-4 mb-6">

                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {grievance.title}
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    ID: {grievance._id}
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass(
                    grievance.status
                  )}`}
                >
                  {grievance.status}
                </span>

              </div>

              <div className="mb-6">

                <h3 className="font-semibold text-gray-700 mb-2">
                  Description
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {grievance.description}
                </p>

              </div>

              <div className="grid sm:grid-cols-2 gap-5">

                <div>
                  <p className="text-sm text-gray-400">
                    Category
                  </p>

                  <p className="font-semibold text-gray-700 mt-1">
                    {grievance.category}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Location
                  </p>

                  <p className="font-semibold text-gray-700 mt-1">
                    {grievance.location}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Priority
                  </p>

                  <p className="font-semibold text-gray-700 mt-1">
                    {grievance.priority}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Submitted On
                  </p>

                  <p className="font-semibold text-gray-700 mt-1">
                    {new Date(
                      grievance.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

              </div>

            </div>

            {/* CITIZEN DETAILS */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">

              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Citizen Details
              </h2>

              {grievance.citizen ? (
                <div className="grid sm:grid-cols-3 gap-5">

                  <div>
                    <p className="text-sm text-gray-400">
                      Name
                    </p>

                    <p className="font-semibold text-gray-700 mt-1">
                      {grievance.citizen.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      Email
                    </p>

                    <p className="font-semibold text-gray-700 mt-1 break-all">
                      {grievance.citizen.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      Phone
                    </p>

                    <p className="font-semibold text-gray-700 mt-1">
                      {grievance.citizen.phone}
                    </p>
                  </div>

                </div>
              ) : (
                <p className="text-gray-500">
                  Citizen information unavailable.
                </p>
              )}

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* ASSIGN OFFICER */}
            <div className="bg-white rounded-2xl shadow-sm p-6">

              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Assign Officer
              </h2>

              {grievance.assignedOfficer ? (

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

                  <p className="text-sm text-blue-500">
                    Currently Assigned
                  </p>

                  <p className="font-bold text-blue-800 mt-1">
                    {grievance.assignedOfficer.name}
                  </p>

                  <p className="text-sm text-blue-700 mt-1 break-all">
                    {grievance.assignedOfficer.email}
                  </p>

                  <p className="text-sm text-blue-700 mt-1">
                    {grievance.assignedOfficer.phone}
                  </p>

                </div>

              ) : (

                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Officer
                  </label>

                  <select
                    value={selectedOfficer}
                    onChange={(e) =>
                      setSelectedOfficer(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >

                    <option value="">
                      Select an officer
                    </option>

                    {officers.map((officer) => (
                      <option
                        key={officer._id}
                        value={officer._id}
                      >
                        {officer.name}
                      </option>
                    ))}

                  </select>

                  <button
                    onClick={handleAssign}
                    disabled={assigning}
                    className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {assigning
                      ? "Assigning..."
                      : "Assign Officer"}
                  </button>
                </>

              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminGrievanceDetails;