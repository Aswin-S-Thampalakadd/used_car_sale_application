import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { enquiriesAPI } from "../../api/api";
import "./Enquiries.css";

const STATUS_LABELS = { new: "New", contacted: "Contacted", closed: "Closed" };
const STATUS_COLORS = {
  new: "enq-status-new",
  contacted: "enq-status-contacted",
  closed: "enq-status-closed",
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });

const Enquiries = () => {
  const { isAuthenticated, isDealer } = useAuth();
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
  }, [isAuthenticated, navigate]);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await enquiriesAPI.getMine();
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch {
      setError("Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEnquiries(); }, [loadEnquiries]);

  const handleStatusChange = async (enquiryId, newStatus) => {
    setUpdatingId(enquiryId);
    try {
      const res = await enquiriesAPI.updateStatus(enquiryId, newStatus);
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e))
        );
      } else {
        setError("Failed to update status.");
      }
    } catch {
      setError("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (enquiryId) => {
    if (!window.confirm("Delete this enquiry?")) return;
    setDeletingId(enquiryId);
    try {
      const res = await enquiriesAPI.delete(enquiryId);
      if (res.ok) setEnquiries((prev) => prev.filter((e) => e.id !== enquiryId));
      else setError("Failed to delete enquiry.");
    } catch {
      setError("Failed to delete enquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered =
    filterStatus === "all"
      ? enquiries
      : enquiries.filter((e) => e.status === filterStatus);

  if (loading) {
    return (
      <div className="enq-loading">
        <div className="dash-spinner" />
        <p>Loading enquiries…</p>
      </div>
    );
  }

  return (
    <div className="enq-page">
      <div className="enq-container">
        <div className="enq-header">
          <div>
            <h1 className="enq-title">
              {isDealer ? "Customer Enquiries" : "My Enquiries"}
            </h1>
            <p className="enq-subtitle">
              {enquiries.length} enquir{enquiries.length !== 1 ? "ies" : "y"}
            </p>
          </div>
        </div>

        {error && (
          <div className="enq-error" role="alert">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="enq-filter-tabs" role="tablist">
          {["all", "new", "contacted", "closed"].map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={filterStatus === s}
              className={`enq-filter-tab ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
              <span className="enq-filter-count">
                {s === "all"
                  ? enquiries.length
                  : enquiries.filter((e) => e.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="enq-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3>No enquiries yet</h3>
            <p>
              {isDealer
                ? "When customers enquire about your listings, they'll appear here."
                : "Find a car you like and contact the dealer."}
            </p>
            {!isDealer && (
              <Link to="/used-cars" className="enq-browse-btn">Browse Cars</Link>
            )}
          </div>
        ) : (
          <div className="enq-list">
            {filtered.map((enq) => {
              const car = enq.car;
              const img =
                car?.carImages?.find((i) => i.isPrimary) || car?.carImages?.[0];

              return (
                <article key={enq.id} className="enq-card">
                  {/* Car preview */}
                  <div className="enq-car-preview">
                    <div className="enq-car-image">
                      {img ? (
                        <img src={img.imageUrl} alt={`${car.make} ${car.model}`} loading="lazy" />
                      ) : (
                        <div className="enq-car-no-image">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="enq-car-info">
                      {car ? (
                        <>
                          <Link to={`/used-cars/${car.id}`} className="enq-car-name">
                            {car.year} {car.make} {car.model}
                          </Link>
                          <p className="enq-car-variant">{car.variant}</p>
                          <p className="enq-car-price">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency", currency: "INR", maximumFractionDigits: 0,
                            }).format(Number(car.price))}
                          </p>
                        </>
                      ) : (
                        <p className="enq-car-variant">Car listing removed</p>
                      )}
                    </div>
                  </div>

                  {/* Enquiry details */}
                  <div className="enq-details">
                    <div className="enq-meta">
                      <span className={`enq-status ${STATUS_COLORS[enq.status]}`}>
                        {STATUS_LABELS[enq.status]}
                      </span>
                      <span className="enq-date">{formatDate(enq.createdAt)}</span>
                    </div>

                    {/* Show customer info to dealer */}
                    {isDealer && enq.customer && (
                      <div className="enq-customer-info">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <div>
                          <p className="enq-customer-name">{enq.customer.name}</p>
                          <p className="enq-customer-contact">
                            {enq.customer.phone && (
                              <a href={`tel:${enq.customer.phone}`}>{enq.customer.phone}</a>
                            )}
                            {enq.customer.email && (
                              <a href={`mailto:${enq.customer.email}`}>{enq.customer.email}</a>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {enq.message && (
                      <p className="enq-message">"{enq.message}"</p>
                    )}

                    <div className="enq-actions">
                      {/* Dealer: update status */}
                      {isDealer && (
                        <select
                          className="enq-status-select"
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                          disabled={updatingId === enq.id}
                          aria-label="Update status"
                        >
                          {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      )}

                      {/* Customer: delete */}
                      {!isDealer && (
                        <button
                          className="enq-delete-btn"
                          onClick={() => handleDelete(enq.id)}
                          disabled={deletingId === enq.id}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                          {deletingId === enq.id ? "Deleting…" : "Delete"}
                        </button>
                      )}

                      {car && (
                        <Link to={`/used-cars/${car.id}`} className="enq-view-car-btn">
                          View Car
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      )}
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

export default Enquiries;
