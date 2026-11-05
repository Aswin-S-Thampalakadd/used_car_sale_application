import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { carsAPI, operatorsAPI } from "../../api/api";
import { carSlug } from "../../utils/carSlug";
import "./OperatorDashboard.css";

const STATUS_LABELS = { active: "Active", draft: "Draft", sold: "Sold", reserved: "Reserved", inactive: "Inactive" };

const formatPrice = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(v));

const formatKm = (km) => `${Number(km).toLocaleString("en-IN")} km`;

export default function OperatorDashboard() {
  const { user, logout, isOperator } = useAuth();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [profile, setProfile] = useState(null);
  const [limitInfo, setLimitInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteCar, setConfirmDeleteCar] = useState(null);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!isOperator) { navigate("/login"); }
    if (user?.mustChangePassword) { navigate("/operator/change-password"); }
  }, [isOperator, user, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, carsRes, limitRes] = await Promise.all([
        operatorsAPI.getMyProfile(),
        carsAPI.getAll({ limit: 200 }),
        operatorsAPI.checkCarLimit(),
      ]);
      if (profileRes.ok) setProfile(await profileRes.json());
      if (carsRes.ok) {
        const d = await carsRes.json();
        setCars(d.cars ?? []);
      }
      if (limitRes.ok) setLimitInfo(await limitRes.json());
    } catch { setError("Failed to load dashboard."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (car) => setConfirmDeleteCar(car);

  const confirmDelete = async () => {
    if (!confirmDeleteCar) return;
    const carId = confirmDeleteCar.id;
    setConfirmDeleteCar(null);
    setDeletingId(carId);
    try {
      const res = await carsAPI.delete(carId);
      if (res.ok) { setCars((p) => p.filter((c) => c.id !== carId)); load(); }
      else setError("Failed to delete listing.");
    } catch { setError("Failed to delete listing."); }
    finally { setDeletingId(null); }
  };

  const handleAddCar = () => {
    if (limitInfo?.hasReachedLimit) { setShowLimitPopup(true); return; }
    navigate("/operator/add-car");
  };

  const filtered = filterStatus === "all" ? cars : cars.filter((c) => c.status === filterStatus);

  if (loading) return (
    <div className="op-loader">
      <div className="op-loader-ring" />
      <span>Loading…</span>
    </div>
  );

  return (
    <div className="op-root">
      <aside className="op-sidebar">
        <div className="op-sidebar-brand">
          <img src="/logo.svg" alt="VandiMart" className="op-brand-logo" />
        </div>

        <div className="op-sidebar-profile">
          <div className="op-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <p className="op-sidebar-name">{user?.name}</p>
            <p className="op-sidebar-role">Operator</p>
            {profile?.dealer && (
              <p className="op-sidebar-dealer">{profile.dealer.dealershipName}</p>
            )}
          </div>
        </div>

        {limitInfo && (
          <div className="op-limit-widget">
            <div className="op-limit-bar-wrap">
              <div className="op-limit-bar">
                <div
                  className="op-limit-bar-fill"
                  style={{ width: `${Math.min((limitInfo.currentCount / limitInfo.limit) * 100, 100)}%` }}
                />
              </div>
              <span className="op-limit-text">
                {limitInfo.currentCount} / {limitInfo.limit} listings ({limitInfo.planType} plan)
              </span>
            </div>
          </div>
        )}

        <nav className="op-nav">
          <Link to="/operator/dashboard" className="op-nav-item op-nav-item--active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
            My Listings
          </Link>
          <Link to="/operator/add-car" className="op-nav-item" onClick={(e) => { if (limitInfo?.hasReachedLimit) { e.preventDefault(); setShowLimitPopup(true); } }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Listing
          </Link>
        </nav>

        <div className="op-sidebar-footer">
          <button className="op-logout-btn" onClick={() => { logout(); navigate("/login"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="op-main">
        <header className="op-topbar">
          <h1 className="op-page-title">My Listings</h1>
          <button className="op-add-btn" onClick={handleAddCar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Listing
          </button>
        </header>

        {error && <div className="op-error" role="alert">{error}<button onClick={() => setError("")}>×</button></div>}

        <div className="op-filter-row">
          {["all", "active", "draft", "reserved", "sold", "inactive"].map((s) => (
            <button key={s} className={`op-filter-chip ${filterStatus === s ? "op-filter-chip--active" : ""}`} onClick={() => setFilterStatus(s)}>
              {s === "all" ? "All" : STATUS_LABELS[s]}
              <span className="op-chip-count">{s === "all" ? cars.length : cars.filter((c) => c.status === s).length}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="op-empty">
            <h3>{filterStatus === "all" ? "No listings yet" : `No ${STATUS_LABELS[filterStatus]} listings`}</h3>
            <p>Add your first car listing to get started.</p>
            <button className="op-add-btn" onClick={handleAddCar}>Add Listing</button>
          </div>
        ) : (
          <div className="op-cards-grid">
            {filtered.map((car) => {
              const img = car.carImages?.find((i) => i.isPrimary) ?? car.carImages?.[0];
              return (
                <article key={car.id} className={`op-car-card ${deletingId === car.id ? "op-car-card--busy" : ""}`}>
                  <div className="op-car-img-wrap">
                    {img ? <img src={img.imageUrl} alt={`${car.make} ${car.model}`} loading="lazy" /> : <div className="op-car-no-img">No photo</div>}
                    <span className={`op-status-pill op-status-pill--${car.status}`}>{STATUS_LABELS[car.status] ?? car.status}</span>
                  </div>
                  <div className="op-car-body">
                    <h3 className="op-car-title">{car.year} {car.make} {car.model}</h3>
                    {car.variant && <p className="op-car-variant">{car.variant}</p>}
                    <div className="op-car-specs">
                      <span>{formatKm(car.kilometersDriven)}</span>
                      <span style={{ textTransform: "capitalize" }}>{car.fuelType}</span>
                      <span style={{ textTransform: "capitalize" }}>{car.transmission}</span>
                    </div>
                    <div className="op-car-price">{formatPrice(car.price)}</div>
                  </div>
                  <div className="op-car-footer">
                    <Link to={`/operator/edit-car/${car.id}`} className="op-icon-btn op-icon-btn--edit" title="Edit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </Link>
                    <Link to={carSlug(car)} target="_blank" rel="noopener noreferrer" className="op-icon-btn op-icon-btn--view" title="View">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </Link>
                    <button className="op-icon-btn op-icon-btn--delete" onClick={() => handleDelete(car)} disabled={deletingId === car.id} title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {confirmDeleteCar && (
        <div className="op-confirm-backdrop" onClick={() => setConfirmDeleteCar(null)}>
          <div className="op-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="op-confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
            </div>
            <h3>Delete listing?</h3>
            <p>You're about to permanently delete <strong>{confirmDeleteCar.year} {confirmDeleteCar.make} {confirmDeleteCar.model}</strong>. This cannot be undone.</p>
            <div className="op-confirm-actions">
              <button className="op-confirm-cancel" onClick={() => setConfirmDeleteCar(null)}>Cancel</button>
              <button className="op-confirm-delete" onClick={confirmDelete}>Delete permanently</button>
            </div>
          </div>
        </div>
      )}

      {showLimitPopup && (
        <div className="op-confirm-backdrop" onClick={() => setShowLimitPopup(false)}>
          <div className="op-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="op-confirm-icon op-confirm-icon--warn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h3>Listing limit reached</h3>
            <p>
              Your dealer's <strong>{limitInfo?.planType}</strong> plan allows <strong>{limitInfo?.limit}</strong> listings. You've used all {limitInfo?.currentCount}.
              <br /><br />
              Contact your dealer to upgrade the plan and add more listings.
            </p>
            <div className="op-confirm-actions">
              <button className="op-confirm-cancel" onClick={() => setShowLimitPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
