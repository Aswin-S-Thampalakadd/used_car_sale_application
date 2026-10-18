import React, { useCallback, useEffect, useState } from "react";
import { MdDeleteForever, MdRefresh, MdStar, MdCheckCircle, MdCancel } from "react-icons/md";
import { adminAPI } from "../../api/api";
import "./Admin.css";

const LIMIT = 20;

/* ── Confirm modal ── */
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <div className="admin-modal__title">Confirm Delete</div>
        <div className="admin-modal__body">{message}</div>
        <div className="admin-modal__actions">
          <button className="btn-sm btn-sm--gray" onClick={onCancel}>Cancel</button>
          <button className="btn-sm btn-sm--danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Star display ── */
function StarRating({ rating }) {
  return (
    <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <MdStar key={i} style={{ opacity: i < rating ? 1 : 0.25, fontSize: "1rem" }} />
      ))}
      <span style={{ marginLeft: 4, color: "#64748b", fontSize: "0.78rem" }}>{rating}/5</span>
    </span>
  );
}

/* ── Approval badge ── */
function ApprovalBadge({ isApproved }) {
  return isApproved ? (
    <span className="badge badge--green" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <MdCheckCircle style={{ fontSize: "0.85rem" }} /> Approved
    </span>
  ) : (
    <span className="badge badge--yellow" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <MdCancel style={{ fontSize: "0.85rem" }} /> Pending
    </span>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews]           = useState([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [filterType, setFilterType]     = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // "" | "pending" | "approved"
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [confirm, setConfirm]           = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [approving, setApproving]       = useState(null); // reviewId being toggled

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (filterType)   params.reviewType  = filterType;
      if (filterStatus) params.isApproved  = filterStatus === "approved" ? "true" : "false";
      const res  = await adminAPI.getReviews(params);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setReviews(data.reviews);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterStatus]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { setPage(1); }, [filterType, filterStatus]);

  /* ── Approve / revoke ── */
  const handleApprove = async (review) => {
    const next = !review.isApproved;
    setApproving(review.id);
    try {
      const res  = await adminAPI.approveReview(review.id, next);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      // Optimistically update the row in state
      setReviews((prev) =>
        prev.map((r) => r.id === review.id ? { ...r, isApproved: next } : r)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setApproving(null);
    }
  };

  /* ── Delete ── */
  const handleDelete = (review) => {
    setConfirm({
      message: `Delete this ${review.reviewType} review by "${review.customerName || `User #${review.customerId}`}" (${review.rating} stars)?`,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const res = await adminAPI.deleteReview(review.id);
          if (!res.ok) throw new Error("Delete failed");
          await fetchReviews();
        } catch (err) {
          setError(err.message);
        } finally {
          setActionLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  const totalPages = Math.ceil(total / LIMIT);
  const pendingCount  = reviews.filter((r) => r.reviewType === "app" && !r.isApproved).length;

  return (
    <div>
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reviews</h1>
          <p className="admin-page-subtitle">
            {total} total
            {pendingCount > 0 && (
              <span style={{
                marginLeft: 10,
                background: "#fef3c7",
                color: "#b45309",
                padding: "2px 10px",
                borderRadius: 999,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}>
                {pendingCount} pending approval
              </span>
            )}
          </p>
        </div>
        <button className="btn-sm btn-sm--gray" onClick={fetchReviews}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* ── Filters ── */}
      <div className="admin-toolbar" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select
          className="admin-filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="dealer">Dealer Reviews</option>
          <option value="app">App Reviews</option>
        </select>

        <select
          className="admin-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          {loading ? (
            <div className="admin-loading" />
          ) : reviews.length === 0 ? (
            <div className="admin-empty">No reviews found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Target</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} style={r.reviewType === "app" && !r.isApproved
                    ? { background: "#fffbeb" } : undefined}>
                    <td>
                      <span className={`badge ${r.reviewType === "app" ? "badge--purple" : "badge--blue"}`}>
                        {r.reviewType}
                      </span>
                    </td>
                    <td>
                      <div>{r.customerName || "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{r.customerEmail}</div>
                    </td>
                    <td>
                      {r.reviewType === "dealer" && r.dealerId
                        ? `Dealer #${r.dealerId}`
                        : r.carId
                        ? `${r.carMake} ${r.carModel}`
                        : "Platform"}
                    </td>
                    <td><StarRating rating={r.rating} /></td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{
                        overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap", maxWidth: 180,
                      }} title={r.comment || ""}>
                        {r.comment || <span style={{ color: "#94a3b8" }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <ApprovalBadge isApproved={r.isApproved} />
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {/* Approve / Revoke — only meaningful for app reviews */}
                        {r.reviewType === "app" && (
                          <button
                            className={`btn-sm ${r.isApproved ? "btn-sm--gray" : "btn-sm--success"}`}
                            title={r.isApproved ? "Revoke approval" : "Approve review"}
                            onClick={() => handleApprove(r)}
                            disabled={approving === r.id}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {approving === r.id
                              ? "…"
                              : r.isApproved
                              ? "Revoke"
                              : "✓ Approve"}
                          </button>
                        )}
                        <button
                          className="btn-icon btn-icon--danger"
                          title="Delete review"
                          onClick={() => handleDelete(r)}
                        >
                          <MdDeleteForever />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="admin-pagination">
            <span>Page {page} of {totalPages} — {total} results</span>
            <div className="admin-pagination__btns">
              <button className="admin-pagination__btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <button className="admin-pagination__btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
