import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

function SubmitGrievance() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    location: "",
    priority: "Medium",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiRequest("/grievances", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSuccess("Grievance submitted successfully!");

      setFormData({
        title: "",
        description: "",
        category: "Other",
        location: "",
        priority: "Medium",
      });

      setTimeout(() => {
        navigate("/citizen");
      }, 1000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}

      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">

          <button
            onClick={() => navigate("/citizen")}
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Back to Dashboard
          </button>

        </div>
      </nav>

      {/* FORM */}

      <main className="max-w-3xl mx-auto px-6 py-8">

        <div className="bg-white rounded-2xl shadow-sm p-8">

          <h1 className="text-3xl font-bold text-gray-800">
            Submit a Grievance
          </h1>

          <p className="text-gray-500 mt-2 mb-8">
            Provide details about the issue you want to report.
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

          <form onSubmit={handleSubmit}>

            {/* TITLE */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grievance Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Water supply problem"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* DESCRIPTION */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your grievance in detail..."
                rows="5"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

            </div>

            {/* CATEGORY */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="Other">Other</option>
                <option value="Water">Water</option>
                <option value="Road">Road</option>
                <option value="Electricity">Electricity</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Transport">Transport</option>

              </select>

            </div>

            {/* LOCATION */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: Coimbatore"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* PRIORITY */}

            <div className="mb-6">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>

              </select>

            </div>

            {/* BUTTONS */}

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() => navigate("/citizen")}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Submitting..."
                  : "Submit Grievance"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default SubmitGrievance;