
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api";
import CivicEmblem from "../components/CivicEmblem";
import { Alert } from "../components/UI";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(
        data.user.role === "citizen"
          ? "/citizen"
          : data.user.role === "officer"
          ? "/officer"
          : data.user.role === "employee"
          ? "/employee"
          : data.user.role === "higher_official"
          ? "/higher-official"
          : "/admin"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const change = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const fillDemo = (identifier) => {
    setFormData({
      email: identifier,
      password: "ChangeMe@123",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <CivicEmblem className="mx-auto h-12 w-12 drop-shadow-xs" />

        <h1 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Sathyamangalam Municipality
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Citizen Grievance Redressal & Resolution Tracking
        </p>
      </div>

      {/* Clean Sign-in Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xs rounded-2xl border border-slate-200">

          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Sign In to Your Account
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Enter your mobile number or email address to continue
            </p>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Mobile Number or Email
              </label>

              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={change}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={change}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0b2545] py-2.5 text-sm font-bold text-white hover:bg-[#133e6a] transition shadow-xs disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400 block mb-2 text-center">
              Quick Demo Logins (Default password: ChangeMe@123)
            </p>

            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                type="button"
                onClick={() => fillDemo("9842100001")}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-900 transition"
              >
                Citizen
              </button>

              <button
                type="button"
                onClick={() =>
                  fillDemo("electric-officer-1@sathyamangalam.gov.in")
                }
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-900 transition"
              >
                Officer
              </button>

              <button
                type="button"
                onClick={() =>
                  fillDemo("higher.official@sathyamangalam.gov.in")
                }
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 transition"
              >
                Higher Official
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-blue-900 hover:underline"
            >
              Register as Citizen
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Government of Tamil Nadu • Erode District Administration
        </p>
      </div>
    </div>
  );
}

export default Login;

