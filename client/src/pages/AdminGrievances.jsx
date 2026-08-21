import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

function AdminGrievances() {
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const data = await apiRequest("/admin/grievances");

      console.log("Admin grievances response:", data);

      setGrievances(data.grievances || []);
    } catch (error) {
      console.error("Grievances error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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
          Loading grievances...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <button
            onClick={() => navigate("/admin")}
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
      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Grievances
          </h1>

          <p className="text-gray-500 mt-1">
            View and manage all citizen grievances
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {grievances.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500">
              No grievances found.
            </p>
          </div>
        )}

        {/* GRIEVANCES */}
        <div className="space-y-5">

          {grievances.map((grievance) => (

            <div
              key={grievance._id}
              className="bg-white rounded-2xl shadow-sm p-6"
            >

              <div className="flex flex-col lg:flex-row lg:justify-between gap-5">

                {/* LEFT */}
                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-3 mb-3">

                    <h2 className="text-xl font-bold text-gray-800">
                      {grievance.title}
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                        grievance.status
                      )}`}
                    >
                      {grievance.status}
                    </span>

                  </div>

                  <p className="text-gray-600 mb-4">
                    {grievance.description}
                  </p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div>
                      <p className="text-sm text-gray-400">
                        Category
                      </p>

                      <p className="font-semibold text-gray-700">
                        {grievance.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">
                        Priority
                      </p>

                      <p className="font-semibold text-gray-700">
                        {grievance.priority}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">
                        Location
                      </p>

                      <p className="font-semibold text-gray-700">
                        {grievance.location}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">
                        Submitted
                      </p>

                      <p className="font-semibold text-gray-700">
                        {new Date(
                          grievance.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                  </div>

                </div>

                {/* RIGHT */}
                <div className="flex items-center">

                  <button
                    onClick={() =>
                      navigate(`/admin/grievances/${grievance._id}`)
                    }
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Manage
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

export default AdminGrievances;