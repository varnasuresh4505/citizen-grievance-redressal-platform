import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api";

function OfficerGrievanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [status, setStatus] = useState("");
  const [resolution, setResolution] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchGrievance();
  }, [id]);

  const fetchGrievance = async () => {
    try {
      setError("");

      // Get officer's assigned grievances
      const data = await apiRequest("/officer/grievances");

      const foundGrievance = data.grievances.find(
        (item) => item._id === id
      );

      if (!foundGrievance) {
        setError("Grievance not found or not assigned to you");
        return;
      }

      setGrievance(foundGrievance);
      setStatus(foundGrievance.status);
      setResolution(foundGrievance.resolution || "");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (status === "Resolved" && resolution.trim() === "") {
      setError(
        "Please enter a resolution message before resolving the grievance."
      );
      return;
    }

    try {
      setUpdating(true);

      const data = await apiRequest(
        `/officer/grievances/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
            resolution,
          }),
        }
      );

      setGrievance(data.grievance);

      setSuccess(
        "Grievance status updated successfully."
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const getStatusClass = (currentStatus) => {
    if (currentStatus === "Resolved") {
      return "bg-green-100 text-green-700";
    }

    if (currentStatus === "In Progress") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">
          Loading grievance...
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
              onClick={() => navigate("/officer")}
              className="text-blue-600 font-semibold hover:underline"
            >
              ← Back to Dashboard
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-10">

          <div className="bg-red-100 text-red-700 p-5 rounded-lg">
            {error}
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}

      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          <button
            onClick={() => navigate("/officer")}
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

        <h1 className="text-3xl font-bold text-gray-800">
          Manage Grievance
        </h1>

        <p className="text-gray-500 mt-1 mb-8">
          Review the grievance and update its status
        </p>

        {/* SUCCESS */}

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
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

              {/* DESCRIPTION */}

              <div className="mb-6">

                <h3 className="font-semibold text-gray-700 mb-2">
                  Description
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {grievance.description}
                </p>

              </div>

              {/* DETAILS */}

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
                    ).toLocaleString()}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* CITIZEN DETAILS */}

          <div>

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Citizen Information
              </h2>

              {grievance.citizen && (
                <div className="space-y-4">

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
              )}

            </div>

          </div>

        </div>

        {/* UPDATE STATUS */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">

          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Update Grievance
          </h2>

          <form onSubmit={handleUpdate}>

            {/* STATUS */}

            <div className="mb-6">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="Assigned">
                  Assigned
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Resolved">
                  Resolved
                </option>

              </select>

            </div>

            {/* RESOLUTION */}

            <div className="mb-6">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution
              </label>

              <textarea
                value={resolution}
                onChange={(e) =>
                  setResolution(e.target.value)
                }
                rows="5"
                placeholder="Enter resolution details..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              {status === "Resolved" && (
                <p className="text-sm text-red-500 mt-2">
                  Resolution message is required when resolving.
                </p>
              )}

            </div>

            {/* UPDATE BUTTON */}

            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {updating
                ? "Updating..."
                : "Update Grievance"}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

export default OfficerGrievanceDetails;