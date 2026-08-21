import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

function OfficerDashboard() {
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchAssignedGrievances();
  }, []);

  const fetchAssignedGrievances = async () => {
    try {
      const data = await apiRequest("/officer/grievances");
      setGrievances(data.grievances || []);
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

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div>
            <h1 className="text-xl font-bold text-blue-600">
              Citizen Grievance
            </h1>

            <p className="text-xs text-gray-500">
              Officer Portal
            </p>
          </div>

          <div className="flex items-center gap-4">

            <span className="text-gray-700">
              Welcome, {user?.name}
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-800">
            Officer Dashboard
          </h2>

          <p className="text-gray-500 mt-1">
            View and manage your assigned grievances
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="text-center py-10">
            <p className="text-gray-500">
              Loading assigned grievances...
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!loading && grievances.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">

            <h3 className="text-xl font-semibold text-gray-700">
              No grievances assigned
            </h3>

            <p className="text-gray-500 mt-2">
              You currently don't have any grievances assigned to you.
            </p>

          </div>
        )}

        {/* GRIEVANCES */}

        {!loading && grievances.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {grievances.map((grievance) => (

              <div
                key={grievance._id}
                className="bg-white rounded-xl shadow-sm p-6"
              >

                <div className="flex justify-between items-start gap-3">

                  <h3 className="text-lg font-bold text-gray-800">
                    {grievance.title}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                      grievance.status
                    )}`}
                  >
                    {grievance.status}
                  </span>

                </div>

                <p className="text-gray-500 text-sm mt-3">
                  {grievance.description}
                </p>

                <div className="mt-4 space-y-2 text-sm">

                  <p>
                    <span className="font-semibold">
                      Category:
                    </span>{" "}
                    {grievance.category}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Location:
                    </span>{" "}
                    {grievance.location}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Priority:
                    </span>{" "}
                    {grievance.priority}
                  </p>

                  {grievance.citizen && (
                    <p>
                      <span className="font-semibold">
                        Citizen:
                      </span>{" "}
                      {grievance.citizen.name}
                    </p>
                  )}

                </div>

                <button
                  onClick={() =>
                    navigate(`/officer/grievance/${grievance._id}`)
                  }
                  className="w-full mt-5 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Manage Grievance
                </button>

              </div>

            ))}

          </div>
        )}

      </main>

    </div>
  );
}

export default OfficerDashboard;