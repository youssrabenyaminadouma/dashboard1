import "./css/sidebar.css";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdBarChart,
  MdLogout,
  MdAssignment,
  MdPeople,
} from "react-icons/md";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("userRole");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isActive = (path) => location.pathname === path;

  const ROLE_LABELS = {
    admin: "Director",
    supervisor: "Supervisor",
    controller: "Controller",
    viewer: "Viewer",
  };

  function getInitials(name = "") {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.slice(0, 2).toUpperCase() || "??";
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-logo">Nestlé</div>

        <nav className="sidebar-nav">

          {/* ── MAIN ── */}
          <div className="sidebar-section">Main</div>

          <div
            className={`sidebar-item ${isActive("/dashboard") ? "active" : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            <MdDashboard className="sidebar-icon" />
            <span>Dashboard</span>
          </div>

          {/* ── MANAGE ── */}
          {(role === "admin" || role === "supervisor" || role === "controller") && (
            <div className="sidebar-section">Manage</div>
          )}

          {role === "supervisor" && (
            <div
              className={`sidebar-item ${isActive("/kpiform") ? "active" : ""}`}
              onClick={() => navigate("/kpiform")}
            >
              <MdAssignment className="sidebar-icon" />
              <span>Form</span>
            </div>
          )}

          {(role === "admin" || role === "supervisor" || role === "controller") && (
            <div
              className={`sidebar-item ${isActive("/rapport") ? "active" : ""}`}
              onClick={() => navigate("/rapport")}
            >
              <MdBarChart className="sidebar-icon" />
              <span>Rapport</span>
            </div>
          )}

          {(role === "admin" || role === "supervisor" || role === "controller") && (
            <div
              className={`sidebar-item ${isActive("/members") ? "active" : ""}`}
              onClick={() => navigate("/members")}
            >
              <MdPeople className="sidebar-icon" />
              <span>Members</span>
            </div>
          )}

        </nav>

        {/* ── USER CARD + LOGOUT ── */}
        <div className="sidebar-divider" />

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(user.name || role || "?")}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name || "User"}</span>
            <span className="sidebar-user-role">
              {ROLE_LABELS[role] || role}
            </span>
          </div>
        </div>

        <div className="sidebar-logout" onClick={handleLogout}>
          <MdLogout className="sidebar-icon" />
          <span>Logout</span>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}

export default Sidebar;