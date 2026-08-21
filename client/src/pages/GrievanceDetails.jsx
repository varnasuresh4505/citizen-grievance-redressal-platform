import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api";

function GrievanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGrievance();
  }, [id]);

  const fetchGrievance = async () => {
    try {
      const data = await apiRequest(`/grievances/${id}`);
      setGrievance(data.grievance);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
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

  const isCompleted = (status) => {
    const statuses = [
      "Pending",
      "Assigned",
      "In Progress",
      "Resolved",
    ];

    const currentIndex = statuses.indexOf(grievance.status);
    const statusIndex = statuses.indexOf(status);

    return currentIndex >= statusIndex;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">
          Loading grievance details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">

        <nav className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate("/citizen")}
              className="text-blue-600 font-semibold hover:underline"
            >
              ← Back to Dashboard
            </button>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-red-100 text-red-700 p-5 rounded-lg">
            {error}
          </div>
        </div>

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
            onClick={() => navigate("/citizen")}
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Back to Dashboard
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
            Grievance Details
          </h1>

          <p className="text-gray-500 mt-1">
            Track the status and resolution of your grievance
          </p>

        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT - DETAILS */}

          <div className="lg:col-span-2 space-y-6">

            {/* BASIC DETAILS */}

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

            {/* TRACKING */}

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <h2 className="text-xl font-bold text-gray-800 mb-8">
                Grievance Tracking
              </h2>

              <div className="space-y-7">

                {/* PENDING */}

                <div className="flex items-start gap-4">

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted("Pending")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    ✓
                  </div>

                  <div>

                    <h3 className="font-semibold text-gray-800">
                      Submitted
                    </h3>

                    <p className="text-sm text-gray-500">
                      Your grievance has been submitted successfully.
                    </p>

                  </div>

                </div>

                {/* ASSIGNED */}

                <div className="flex items-start gap-4">

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted("Assigned")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    ✓
                  </div>

                  <div>

                    <h3 className="font-semibold text-gray-800">
                      Officer Assigned
                    </h3>

                    <p className="text-sm text-gray-500">
                      An officer has been assigned to handle your grievance.
                    </p>

                  </div>

                </div>

                {/* IN PROGRESS */}

                <div className="flex items-start gap-4">

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted("In Progress")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    ✓
                  </div>

                  <div>

                    <h3 className="font-semibold text-gray-800">
                      In Progress
                    </h3>

                    <p className="text-sm text-gray-500">
                      The assigned officer is working on your grievance.
                    </p>

                  </div>

                </div>

                {/* RESOLVED */}

                <div className="flex items-start gap-4">

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted("Resolved")
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    ✓
                  </div>

                  <div>

                    <h3 className="font-semibold text-gray-800">
                      Resolved
                    </h3>

                    <p className="text-sm text-gray-500">
                      Your grievance has been resolved.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* RESOLUTION */}

            {grievance.status === "Resolved" && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

                <h2 className="text-xl font-bold text-green-800 mb-3">
                  Resolution
                </h2>

                <p className="text-green-700 leading-relaxed">
                  {grievance.resolution ||
                    "The grievance has been resolved."}
                </p>

                {grievance.resolvedAt && (
                  <p className="text-sm text-green-600 mt-4">
                    Resolved on:{" "}
                    {new Date(
                      grievance.resolvedAt
                    ).toLocaleString()}
                  </p>
                )}

              </div>
            )}

          </div>

          {/* RIGHT - OFFICER */}

          <div className="space-y-6">

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Assigned Officer
              </h2>

              {grievance.assignedOfficer ? (
                <div className="space-y-4">

                  <div>

                    <p className="text-sm text-gray-400">
                      Name
                    </p>

                    <p className="font-semibold text-gray-700 mt-1">
                      {grievance.assignedOfficer.name}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-400">
                      Email
                    </p>

                    <p className="font-semibold text-gray-700 mt-1 break-all">
                      {grievance.assignedOfficer.email}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-400">
                      Phone
                    </p>

                    <p className="font-semibold text-gray-700 mt-1">
                      {grievance.assignedOfficer.phone}
                    </p>

                  </div>

                </div>
              ) : (
                <p className="text-gray-500">
                  An officer has not been assigned yet.
                </p>
              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default GrievanceDetails;