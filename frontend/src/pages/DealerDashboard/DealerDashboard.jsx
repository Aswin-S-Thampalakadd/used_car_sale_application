import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { carsAPI, dealersAPI, subscriptionsAPI } from "../../api/api";
import { carSlug } from "../../utils/carSlug";
import SubscriptionModal from "../../components/SubscriptionModal/SubscriptionModal";
import DealerReviews from "../../components/DealerReviews/DealerReviews";
import "./DealerDashboard.css";

/* ─── constants ─────────────────────────────────────── */
const STATUS_LABELS = {
  active:   "Active",
  draft:    "Draft",
  sold:     "Sold",
  reserved: "Reserved",
  inactive: "Inactive",
};

const formatPrice = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(v));

const formatKm = (km) =>
  `${Number(km).toLocaleString("en-IN")} km`;

const PLAN_META = {
  free:  { label: "Free",  color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
  elite: { label: "Elite", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  pro:   { label: "Pro",   color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
};

/* ─── small sub-components ──────────────────────────── */

/* Status pill */
function StatusPill({ status }) {
  return (
    <span className={`dd-status-pill dd-status-pill--${status}`}>
      <span className="dd-status-dot" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/* Stat card */
function StatCard({ value, label, icon, accent }) {
  return (
    <div className="dd-stat-card" style={{ "--accent": accent }}>
      <div className="dd-stat-icon">{icon}</div>
      <div className="dd-stat-body">
        <span className="dd-stat-value">{value}</span>
        <span className="dd-stat-label">{label}</span>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────── */
const DealerDashboard = () => {
  const { isAuthenticated, isDealer, user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile,        setProfile]        = useState(null);
  const [cars,           setCars]           = useState([]);
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [deletingId,     setDeletingId]     = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [subscription,   setSubscription]   = useState(null);
  const [showSubModal,   setShowSubModal]   = useState(false);
  const [activeTab,      setActiveTab]      = useState("listings");
  const [sidebarOpen,    setSidebarOpen]    = useState(false);   // mobile drawer

  /* auth guard */
  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!isDealer)        { navigate("/");      return; }
  }, [isAuthenticated, isDealer, navigate]);

  /* data fetch */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, carsRes, subRes] = await Promise.all([
        dealersAPI.getMyProfile(),
        dealersAPI.getMyCars(),
        subscriptionsAPI.getMyPlan(),
      ]);
      if (profileRes.ok) setProfile(await profileRes.json());
      if (carsRes.ok) {
        const d = await carsRes.json();
        setCars(d.cars ?? []);
      }
      if (subRes.ok) {
        const d = await subRes.json();
        setSubscription(d.subscription ?? null);
      }
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* actions */
  const handleDelete = async (carId) => {
    if (!window.confirm("Delete this listing permanently?")) return;
    setDeletingId(carId);
    try {
      const res = await carsAPI.delete(carId);
      if (res.ok) setCars((p) => p.filter((c) => c.id !== carId));
      else        setError("Failed to delete listing.");
    } catch {
      setError("Failed to delete listing.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (carId, newStatus) => {
    setUpdatingStatus(carId);
    try {
      const res = await carsAPI.updateStatus(carId, newStatus);
      if (res.ok) setCars((p) => p.map((c) => c.id === carId ? { ...c, status: newStatus } : c));
      else        setError("Failed to update status.");
    } catch {
      setError("Failed to update status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  /* derived */
  const filtered = filterStatus === "all"
    ? cars
    : cars.filter((c) => c.status === filterStatus);

  const stats = {
    total:    cars.length,
    active:   cars.filter((c) => c.status === "active").length,
    sold:     cars.filter((c) => c.status === "sold").length,
    draft:    cars.filter((c) => c.status === "draft").length,
    reserved: cars.filter((c) => c.status === "reserved").length,
  };

  const planType  = subscription?.planType ?? "free";
  const planMeta  = PLAN_META[planType] ?? PLAN_META.free;
  const carLimit  = subscription?.carLimit ?? 5;
  const usagePct  = Math.min((cars.length / carLimit) * 100, 100);

  /* ── loading screen ── */
  if (loading) {
    return (
      <div className="dd-fullscreen-loader">
        <div className="dd-loader-ring" />
        <span>Loading your dashboard…</span>
      </div>
    );
  }

  const dealerName  = profile?.dealershipName ?? user?.name ?? "Dealer";
  const dealerCity  = profile?.city ?? "";
  const isVerified  = profile?.isVerified ?? false;
  const initials    = dealerName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="dd-root">

      {/* ══════════════════════════════
          MOBILE OVERLAY
      ══════════════════════════════ */}
      {sidebarOpen && (
        <div
          className="dd-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════
          SIDEBAR
      ══════════════════════════════ */}
      <aside className={`dd-sidebar ${sidebarOpen ? "dd-sidebar--open" : ""}`}>

        {/* Brand */}
        <div className="dd-sidebar-brand">
          <span className="dd-sidebar-brand-text">
            Wheelz<span>Loop</span>
          </span>
          <button
            className="dd-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Dealer avatar */}
        <div className="dd-sidebar-profile">
          <div className="dd-avatar">{initials}</div>
          <div className="dd-sidebar-profile-info">
            <span className="dd-sidebar-name">{dealerName}</span>
            {dealerCity && <span className="dd-sidebar-city">{dealerCity}</span>}
            {isVerified && (
              <span className="dd-verified-badge">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Plan widget */}
        <button
          className="dd-plan-widget"
          style={{ "--plan-color": planMeta.color, "--plan-bg": planMeta.bg, "--plan-border": planMeta.border }}
          onClick={() => setShowSubModal(true)}
        >
          <div className="dd-plan-widget-top">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="dd-plan-name">{planMeta.label} Plan</span>
            <span className="dd-plan-upgrade-cta">Upgrade ↗</span>
          </div>
          <div className="dd-plan-bar-wrap">
            <div className="dd-plan-bar">
              <div className="dd-plan-bar-fill" style={{ width: `${usagePct}%` }} />
            </div>
            <span className="dd-plan-usage-text">{cars.length} / {carLimit} listings</span>
          </div>
        </button>

        {/* Nav */}
        <nav className="dd-nav" aria-label="Dashboard navigation">
          <button
            className={`dd-nav-item ${activeTab === "listings" ? "dd-nav-item--active" : ""}`}
            onClick={() => { setActiveTab("listings"); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            My Listings
            <span className="dd-nav-badge">{cars.length}</span>
          </button>

          <button
            className={`dd-nav-item ${activeTab === "reviews" ? "dd-nav-item--active" : ""}`}
            onClick={() => { setActiveTab("reviews"); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Reviews
          </button>

          <Link to="/used-cars" className="dd-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Browse Cars
          </Link>
        </nav>

        {/* Sidebar footer */}
        <div className="dd-sidebar-footer">
          <button className="dd-logout-btn" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════
          MAIN AREA
      ══════════════════════════════ */}
      <div className="dd-main">

        {/* ── Top bar ── */}
        <header className="dd-topbar">
          <div className="dd-topbar-left">
            <button
              className="dd-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <h1 className="dd-page-title">
                {activeTab === "listings" ? "My Listings" : "Customer Reviews"}
              </h1>
              <p className="dd-page-sub">
                {activeTab === "listings"
                  ? `${cars.length} total · ${stats.active} active`
                  : "What customers say about you"}
              </p>
            </div>
          </div>

          {activeTab === "listings" && (
            <Link to="/dashboard/add-car" className="dd-add-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Listing
            </Link>
          )}
        </header>

        {/* ── Error banner ── */}
        {error && (
          <div className="dd-error-banner" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {/* ── Content ── */}
        <div className="dd-content">

          {/* ════ LISTINGS TAB ════ */}
          {activeTab === "listings" && (
            <>
              {/* Stat cards */}
              <div className="dd-stats-grid">
                <StatCard value={stats.total}    label="Total Listings" accent="#6366f1"
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>}
                />
                <StatCard value={stats.active}   label="Active"         accent="#10b981"
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>}
                />
                <StatCard value={stats.sold}     label="Sold"           accent="#2563eb"
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                />
                <StatCard value={stats.draft}    label="Drafts"         accent="#f59e0b"
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                />
              </div>

              {/* Filter chips */}
              <div className="dd-filter-row">
                {["all", "active", "draft", "reserved", "sold", "inactive"].map((s) => (
                  <button
                    key={s}
                    className={`dd-filter-chip ${filterStatus === s ? "dd-filter-chip--active" : ""}`}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s === "all" ? "All" : STATUS_LABELS[s]}
                    <span className="dd-chip-count">
                      {s === "all" ? cars.length : cars.filter((c) => c.status === s).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Listings */}
              {filtered.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                    </svg>
                  </div>
                  <h3>
                    {filterStatus === "all"
                      ? "No listings yet"
                      : `No ${STATUS_LABELS[filterStatus] ?? filterStatus} listings`}
                  </h3>
                  <p>Start by adding your first car listing to reach thousands of buyers.</p>
                  <Link to="/dashboard/add-car" className="dd-empty-cta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add your first car
                  </Link>
                </div>
              ) : (
                <div className="dd-cards-grid">
                  {filtered.map((car) => {
                    const img = car.carImages?.find((i) => i.isPrimary) ?? car.carImages?.[0];
                    const isBusy = deletingId === car.id || updatingStatus === car.id;
                    return (
                      <article key={car.id} className={`dd-car-card ${isBusy ? "dd-car-card--busy" : ""}`}>

                        {/* Image */}
                        <div className="dd-car-img-wrap">
                          {img ? (
                            <img src={img.imageUrl} alt={`${car.make} ${car.model}`} loading="lazy" />
                          ) : (
                            <div className="dd-car-no-img">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                              </svg>
                              No photo
                            </div>
                          )}
                          <div className="dd-car-img-status">
                            <StatusPill status={car.status} />
                          </div>
                        </div>

                        {/* Body */}
                        <div className="dd-car-body">
                          <div className="dd-car-title-row">
                            <h3 className="dd-car-title">{car.year} {car.make} {car.model}</h3>
                          </div>
                          {car.variant && (
                            <p className="dd-car-variant">{car.variant}</p>
                          )}

                          <div className="dd-car-specs">
                            <span>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                              </svg>
                              {formatKm(car.kilometersDriven)}
                            </span>
                            <span>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 22V8l7-6 7 6v14"/><path d="M17 22V12h3l1 4v2a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="6" height="8"/>
                              </svg>
                              {car.fuelType?.charAt(0).toUpperCase() + car.fuelType?.slice(1)}
                            </span>
                            <span>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                              </svg>
                              {car.transmission?.charAt(0).toUpperCase() + car.transmission?.slice(1)}
                            </span>
                          </div>

                          <div className="dd-car-price">{formatPrice(car.price)}</div>
                        </div>

                        {/* Actions footer */}
                        <div className="dd-car-footer">
                          <select
                            className="dd-status-select"
                            value={car.status}
                            onChange={(e) => handleStatusChange(car.id, e.target.value)}
                            disabled={isBusy}
                            aria-label="Change listing status"
                          >
                            {Object.entries(STATUS_LABELS).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>

                          <div className="dd-car-actions">
                            <Link
                              to={`/dashboard/edit-car/${car.id}`}
                              className="dd-icon-btn dd-icon-btn--edit"
                              title="Edit listing"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </Link>

                            <Link
                              to={carSlug(car)}
                              className="dd-icon-btn dd-icon-btn--view"
                              title="View public listing"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </Link>

                            <button
                              className="dd-icon-btn dd-icon-btn--delete"
                              onClick={() => handleDelete(car.id)}
                              disabled={isBusy}
                              title="Delete listing"
                            >
                              {deletingId === car.id ? (
                                <span className="dd-mini-spinner" />
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                  <path d="M10 11v6M14 11v6"/>
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ════ REVIEWS TAB ════ */}
          {activeTab === "reviews" && (
            <div className="dd-reviews-wrap">
              <DealerReviews />
            </div>
          )}

        </div>
      </div>

      {/* ── Subscription modal ── */}
      {showSubModal && (
        <SubscriptionModal
          currentPlan={planType}
          onClose={() => setShowSubModal(false)}
          onSuccess={(sub) => { setShowSubModal(false); setSubscription(sub); }}
        />
      )}

    </div>
  );
};

export default DealerDashboard;
