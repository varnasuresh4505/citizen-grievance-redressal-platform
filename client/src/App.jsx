import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/CitizenDashboard";
import SubmitGrievance from "./pages/SubmitGrievance";
import GrievanceDetails from "./pages/GrievanceDetails";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerGrievanceDetails from "./pages/OfficerGrievanceDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGrievances from "./pages/AdminGrievances";
import AdminGrievanceDetails from "./pages/AdminGrievanceDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* CITIZEN DASHBOARD */}

        <Route path="/citizen" element={<CitizenDashboard />} />

        {/* SUBMIT GRIEVANCE */}

        <Route path="/citizen/submit" element={<SubmitGrievance />} />

        {/* CITIZEN GRIEVANCE DETAILS */}

        <Route path="/citizen/grievance/:id" element={<GrievanceDetails />} />

        {/* OFFICER DASHBOARD */}

        <Route path="/officer" element={<OfficerDashboard />} />

        <Route
          path="/officer/grievance/:id"
          element={<OfficerGrievanceDetails />}
        />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route
  path="/admin/grievances"
  element={<AdminGrievances />}
/>

<Route
  path="/admin/grievances/:id"
  element={<AdminGrievanceDetails />}
/>

        {/* DEFAULT */}

        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
