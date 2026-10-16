import React, { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  MdDashboard,
  MdDirectionsCar,
  MdPeople,
  MdVerifiedUser,
  MdQuestionAnswer,
  MdStar,
  MdSubscriptions,
  MdMenu,
  MdClose,
  MdLogout,
  MdAdminPanelSettings,
} from "react-icons/md";
import "./Admin.css";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <MdDashboard /> },
  { to: "/admin/dealers",   label: "Dealers",   icon: <MdVerifiedUser /> },
  { to: "/admin/customers", label: "Customers", icon: <MdPeople /> },
  { to: "/admin/cars",      label: "Cars",      icon: <MdDirectionsCar /> },
  { to: "/admin/enquiries", label: "Enquiries", icon: <MdQuestionAnswer /> },
  { to: "/admin/reviews",   label: "Reviews",   icon: <MdStar /> },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: <MdSubscriptions /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__brand">
          <MdAdminPanelSettings size={26} />
          <span>Admin Panel</span>
          <button
            className="admin-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <MdClose />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "admin-nav-link--active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-link__icon">{item.icon}</span>
              <span className="admin-nav-link__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="admin-sidebar__user-info">
              <span className="admin-sidebar__user-name">{user?.name}</span>
              <span className="admin-sidebar__user-role">Administrator</span>
            </div>
          </div>
          <button
            className="admin-sidebar__logout"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <MdLogout size={20} />
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <button
            className="admin-topbar__menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <MdMenu size={24} />
          </button>
          <span className="admin-topbar__title">Used Cars — Admin</span>
          <button className="admin-topbar__logout-btn" onClick={handleLogout}>
            <MdLogout size={18} />
            <span>Logout</span>
          </button>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
