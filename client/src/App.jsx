import { Component } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/CitizenDashboard";
import SubmitGrievance from "./pages/SubmitGrievance";
import GrievanceDetails from "./pages/GrievanceDetails";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerGrievanceDetails from "./pages/OfficerGrievanceDetails";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeTaskDetails from "./pages/EmployeeTaskDetails";
import HigherOfficialDashboard from "./pages/HigherOfficialDashboard";
import Escalations from "./pages/Escalations";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGrievances from "./pages/AdminGrievances";
import AdminGrievanceDetails from "./pages/AdminGrievanceDetails";
import Notifications from "./pages/Notifications";

class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <main className="min-h-screen bg-slate-50 p-8 text-slate-800"><div className="mx-auto max-w-lg rounded-xl border border-rose-200 bg-white p-6 shadow-sm"><h1 className="text-xl font-bold">This page could not be loaded</h1><p className="mt-2 text-sm text-slate-600">{this.state.error.message || "An unexpected application error occurred."}</p><button className="mt-5 rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white" onClick={() => window.location.assign("/login")}>Return to sign in</button></div></main>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Citizen */}
        <Route path="/citizen" element={<CitizenDashboard />} />
        <Route path="/citizen/submit" element={<SubmitGrievance />} />
        <Route path="/citizen/grievance/:id" element={<GrievanceDetails />} />

        {/* Officer */}
        <Route path="/officer" element={<OfficerDashboard />} />
        <Route path="/officer/grievance/:id" element={<OfficerGrievanceDetails />} />

        {/* Employee */}
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/tasks/:id" element={<EmployeeTaskDetails />} />

        {/* Higher official */}
        <Route path="/higher-official" element={<HigherOfficialDashboard />} />
        <Route path="/higher-official/escalations" element={<Escalations />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/grievances" element={<AdminGrievances />} />
        <Route path="/admin/grievances/:id" element={<AdminGrievanceDetails />} />

        {/* Shared */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter> 
    </AppErrorBoundary> 
  );
}

export default App;
