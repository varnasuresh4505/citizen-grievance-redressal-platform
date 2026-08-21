import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await apiRequest("/admin/dashboard");

      console.log("Admin dashboard response:", data);

      setStats({
        total: data.total || 0,
        pending: data.pending || 0,
        assigned: data.assigned || 0,
        inProgress: data.inProgress || 0,
        resolved: data.resolved || 0,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Citizen Grievance System
            </h1>

            <p className="text-sm text-gray-500">
              Admin Dashboard
            </p>
          </div>

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
          <h2 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h2>

          <p className="text-gray-500 mt-1">
            Monitor and manage citizen grievances
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

          {/* TOTAL */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Total Grievances
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stats.total}
            </p>
          </div>

          {/* PENDING */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {stats.pending}
            </p>
          </div>

          {/* ASSIGNED */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Assigned
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.assigned}
            </p>
          </div>

          {/* IN PROGRESS */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              In Progress
            </p>

            <p className="text-3xl font-bold text-orange-600 mt-2">
              {stats.inProgress}
            </p>
          </div>

          {/* RESOLVED */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Resolved
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.resolved}
            </p>
          </div>

        </div>

        {/* ADMIN ACTIONS */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Admin Actions
          </h2>

          <div className="flex flex-wrap gap-4">

            <button
              onClick={() => navigate("/admin/grievances")}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
            >
              Manage Grievances
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;