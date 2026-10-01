import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { carsAPI, dealersAPI } from "../../api/api";
import "./DealerDashboard.css";

const STATUS_LABELS = {
  draft: "Draft",
  active: "Active",
  sold: "Sold",
  reserved: "Reserved",
  inactive: "Inactive",
};

const STATUS_COLORS = {
  active: "status-active",
  draft: "status-draft",
  sold: "status-sold",
  reserved: "status-reserved",
  inactive: "status-inactive",
};

const formatPrice = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(v));

const formatKm = (km) => `${Number(km).toLocaleString("en-IN")} km`;

const DealerDashboard = () => {
  const { isAuthenticated, isDealer, user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [cars, setCars] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!isDealer) { navigate("/"); return; }
  }, [isAuthenticated, isDealer, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, carsRes] = await Promise.all([
        dealersAPI.getMyProfile(),
        dealersAPI.getMyCars(),
      ]);
      if (profileRes.ok) setProfile(await profileRes.json());
      if (carsRes.ok) {
        const data = await carsRes.json();
        setCars(data.cars || []);
      }
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (carId) => {
    if (!window.confirm("Delete this listing permanently?")) return;
    setDeletingId(carId);
    try {
      const res = await carsAPI.delete(carId);
      if (res.ok) setCars((prev) => prev.filter((c) => c.id !== carId));
      else setError("Failed to delete car.");
    } catch {
      setError("Failed to delete car.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (carId, newStatus) => {
    setUpdatingStatus(carId);
    try {
      const res = await carsAPI.updateStatus(carId, newStatus);
      if (res.ok) {
        setCars((prev) =>
          prev.map((c) => (c.id === carId ? { ...c, status: newStatus } : c))
        );
      } else {
        setError("Failed to update status.");
      }
    } catch {
      setError("Failed to update status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filtered =
    filterStatus === "all"
      ? cars
      : cars.filter((c) => c.status === filterStatus);

  const stats = {
    total: cars.length,
    active: cars.filter((c) => c.status === "active").length,
    sold: cars.filter((c) => c.status === "sold").length,
    draft: cars.filter((c) => c.status === "draft").length,
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" aria-label="Loading" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-container">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dealer Dashboard</h1>
            {profile && (
              <p className="dash-subtitle">
                {profile.dealershipName} · {profile.city || ""}
                {profile.isVerified && (
                  <span className="dash-verified">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Verified
                  </span>
                )}
              </p>
            )}
          </div>
          <Link to="/dashboard/add-car" className="dash-add-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Car
          </Link>
        </div>

        {error && (
          <div className="dash-error" role="alert">
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss">×</button>
          </div>
        )}

        {/* Stats */}
        <div className="dash-stats">
          {[
            { label: "Total Listings", value: stats.total, cls: "" },
            { label: "Active", value: stats.active, cls: "stat-active" },
            { label: "Sold", value: stats.sold, cls: "stat-sold" },
            { label: "Drafts", value: stats.draft, cls: "stat-draft" },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`dash-stat ${cls}`}>
              <span className="dash-stat-value">{value}</span>
              <span className="dash-stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="dash-filter-tabs" role="tablist">
          {["all", "active", "draft", "reserved", "sold", "inactive"].map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={filterStatus === s}
              className={`dash-filter-tab ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
              <span className="dash-filter-count">
                {s === "all" ? cars.length : cars.filter((c) => c.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {/* Listings */}
        {filtered.length === 0 ? (
          <div className="dash-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <h3>{filterStatus === "all" ? "No listings yet" : `No ${STATUS_LABELS[filterStatus] || filterStatus} listings`}</h3>
            <p>Start by adding your first car listing.</p>
            <Link to="/dashboard/add-car" className="dash-empty-btn">Add a car</Link>
          </div>
        ) : (
          <div className="dash-listings">
            {filtered.map((car) => {
              const primaryImg =
                car.carImages?.find((i) => i.isPrimary) || car.carImages?.[0];
              return (
                <article key={car.id} className="dash-listing-card">
                  <div className="dash-listing-image">
                    {primaryImg ? (
                      <img src={primaryImg.imageUrl} alt={`${car.make} ${car.model}`} loading="lazy" />
                    ) : (
                      <div className="dash-listing-no-image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        No image
                      </div>
                    )}
                  </div>

                  <div className="dash-listing-body">
                    <div className="dash-listing-top">
                      <div>
                        <h3 className="dash-listing-title">
                          {car.year} {car.make} {car.model}
                        </h3>
                        <p className="dash-listing-variant">{car.variant}</p>
                      </div>
                      <span className={`dash-status ${STATUS_COLORS[car.status]}`}>
                        {STATUS_LABELS[car.status] || car.status}
                      </span>
                    </div>

                    <div className="dash-listing-specs">
                      <span>{formatKm(car.kilometersDriven)}</span>
                      <span className="sep">·</span>
                      <span style={{ textTransform: "capitalize" }}>{car.fuelType}</span>
                      <span className="sep">·</span>
                      <span style={{ textTransform: "capitalize" }}>{car.transmission}</span>
                    </div>

                    <div className="dash-listing-price">{formatPrice(car.price)}</div>

                    <div className="dash-listing-actions">
                      <Link
                        to={`/dashboard/edit-car/${car.id}`}
                        className="dash-action-btn dash-action-edit"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </Link>

                      <select
                        className="dash-status-select"
                        value={car.status}
                        onChange={(e) => handleStatusChange(car.id, e.target.value)}
                        disabled={updatingStatus === car.id}
                        aria-label="Change status"
                      >
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>

                      <Link
                        to={`/used-cars/${car.id}`}
                        className="dash-action-btn dash-action-view"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                      </Link>

                      <button
                        className="dash-action-btn dash-action-delete"
                        onClick={() => handleDelete(car.id)}
                        disabled={deletingId === car.id}
                        aria-label="Delete listing"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        {deletingId === car.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerDashboard;
