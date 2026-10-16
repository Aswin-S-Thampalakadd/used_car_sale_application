import React, { useEffect, useState } from "react";
import {
  MdPeople,
  MdVerifiedUser,
  MdDirectionsCar,
  MdQuestionAnswer,
  MdStar,
  MdSubscriptions,
  MdPendingActions,
  MdCheckCircle,
  MdSell,
  MdFiberNew,
} from "react-icons/md";
import { adminAPI } from "../../api/api";
import "./Admin.css";

const STAT_CARDS = [
  { key: "totalUsers",           label: "Total Users",           color: "blue",   icon: <MdPeople /> },
  { key: "totalCustomers",       label: "Customers",             color: "teal",   icon: <MdPeople /> },
  { key: "totalDealers",         label: "Dealers",               color: "purple", icon: <MdVerifiedUser /> },
  { key: "verifiedDealers",      label: "Verified Dealers",      color: "green",  icon: <MdCheckCircle /> },
  { key: "pendingDealers",       label: "Pending Verification",  color: "yellow", icon: <MdPendingActions /> },
  { key: "totalCars",            label: "Total Cars",            color: "blue",   icon: <MdDirectionsCar /> },
  { key: "activeCars",           label: "Active Listings",       color: "green",  icon: <MdDirectionsCar /> },
  { key: "soldCars",             label: "Sold Cars",             color: "orange", icon: <MdSell /> },
  { key: "totalEnquiries",       label: "Total Enquiries",       color: "blue",   icon: <MdQuestionAnswer /> },
  { key: "newEnquiries",         label: "New Enquiries",         color: "red",    icon: <MdFiberNew /> },
  { key: "totalReviews",         label: "Reviews",               color: "yellow", icon: <MdStar /> },
  { key: "activeSubscriptions",  label: "Active Subscriptions",  color: "purple", icon: <MdSubscriptions /> },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAPI.getDashboardStats();
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load");
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Platform overview at a glance</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading" />
      ) : (
        <div className="admin-stat-grid">
          {STAT_CARDS.map(({ key, label, color, icon }) => (
            <div key={key} className="admin-stat-card">
              <div className={`admin-stat-card__icon admin-stat-card__icon--${color}`}>
                {icon}
              </div>
              <div className="admin-stat-card__value">
                {stats?.[key] ?? 0}
              </div>
              <div className="admin-stat-card__label">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
