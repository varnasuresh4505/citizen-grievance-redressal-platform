import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CivicEmblem from "./CivicEmblem";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Phone,
  Mail,
  MapPin,
  Building2,
  FilePlus2,
  LayoutDashboard,
  AlertTriangle,
  Clock,
  HelpCircle,
} from "lucide-react";

export default function CivicHeader({
  activeRole = "citizen",
  title = "Citizen Grievance Redressal & Resolution Tracking System",
  onOpenProfile = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Retrieve current user
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || activeRole || "citizen";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getRoleDisplayName = (r) => {
    switch (r) {
      case "higher_official":
        return "Higher Official • Review Authority";
      case "officer":
        return `Nodal Officer • ${user?.department?.name || user?.designation || "Municipal"}`;
      case "employee":
        return `Field Staff • ${user?.department?.name || "Municipal"}`;
      case "admin":
        return "System Administrator";
      case "citizen":
      default:
        return "Registered Citizen";
    }
  };

  const getDashboardPath = () => {
    switch (role) {
      case "higher_official":
        return "/higher-official";
      case "officer":
        return "/officer";
      case "employee":
        return "/employee";
      case "admin":
        return "/admin";
      case "citizen":
      default:
        return "/citizen";
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TN";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs">
      {/* 1. TOP OFFICIAL GOVERNMENT STRIP */}
      <div className="bg-[#0b1f3a] text-slate-200 text-[14px] py-2 font-medium border-b border-[#133056]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white tracking-wide">
              தமிழ்நாடு அரசு • Government of Tamil Nadu
            </span>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="hidden md:inline text-slate-300">
              Erode District Administration
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div className="hidden sm:flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-amber-400" />
                <span>Helpline: 04295-220224</span>
              </span> 
             
            </div>
            
          </div>
        </div>
      </div>

      {/* 2. INSTITUTIONAL MASTHEAD & NAVBAR */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Portal Identity */}
          <Link
            to={getDashboardPath()}
            className="flex items-center gap-3 sm:gap-4 hover:opacity-95 transition group"
            title="Go to Dashboard"
          >
            <CivicEmblem className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 drop-shadow-xs" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider py-1  text-slate-500">
                  சத்தியமங்கலம் நகராட்சி
                </span>
            
                
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-[#0b1f3a] leading-tight truncate">
                Sathyamangalam Municipality
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-blue-800 py-1 leading-none mt-0.5 truncate">
                Citizen Grievance Redressal & Resolution Tracking System
              </p>
            </div>
          </Link>

          {/* Right Action Tools & User Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-4">
            

            {/* Quick Action for Higher Official: Review Escalations */}
            {role === "higher_official" && location.pathname !== "/higher-official/escalations" && (
              <button
                onClick={() => navigate("/higher-official/escalations")}
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-amber-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-800 transition"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Review Escalations</span>
              </button>
            )}

            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              title="Official Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
            </Link>

            {/* USER PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-left transition hover:bg-slate-100 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0b2545] text-xs font-black text-amber-400 shadow-2xs">
                  {initials}
                </div>
                <div className="hidden lg:block text-left max-w-[140px]">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {user?.name || "Official Account"}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 truncate leading-tight">
                    {role === "higher_official"
                      ? "Higher Official"
                      : role === "officer"
                      ? user?.department?.name || "Nodal Officer"
                      : role === "admin"
                      ? "Administrator"
                      : "Verified Citizen"}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-blue-700" : ""
                  }`}
                />
              </button>

              {/* Flyout Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-900/5 focus:outline-hidden z-50">
                  {/* Account Summary Header */}
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#0b2545] text-sm font-bold text-amber-400">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-[11px] font-medium text-blue-700 truncate">
                          {getRoleDisplayName(role)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1 border-t border-slate-200/60 pt-2 text-[11px] text-slate-600">
                      {user?.phone && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>+91 {user.phone}</span>
                        </div>
                      )}
                      {user?.email && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                      {user?.address && (
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{user.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5 text-xs font-medium text-slate-700">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(getDashboardPath());
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-500" />
                      <span>Municipal Dashboard</span>
                    </button>

                    {role === "citizen" && onOpenProfile && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenProfile();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                      >
                        <User className="h-4 w-4 text-slate-500" />
                        <span>Citizen Registration Profile</span>
                      </button>
                    )}

                    {role === "citizen" && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/citizen/submit");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                      >
                        <FilePlus2 className="h-4 w-4 text-slate-500" />
                        <span>File New Grievance</span>
                      </button>
                    )}

                    {role === "higher_official" && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/higher-official/escalations");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span>Escalations Control Desk</span>
                      </button>
                    )}

                    <Link
                      to="/notifications"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <Bell className="h-4 w-4 text-slate-500" />
                      <span>Notifications & Alerts</span>
                    </Link>
                  </div>

                  <div className="my-1.5 border-t border-slate-200"></div>

                  {/* Sign Out Button */}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800 transition"
                  >
                    <LogOut className="h-4 w-4 text-rose-600" />
                    <span>Sign Out from Portal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
