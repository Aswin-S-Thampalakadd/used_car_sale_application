import React, { useCallback, useEffect, useState } from "react";
import {
  MdVerified,
  MdBlock,
  MdCheckCircle,
  MdDeleteForever,
  MdRefresh,
} from "react-icons/md";
import { adminAPI } from "../../api/api";
import "./Admin.css";

const LIMIT = 20;

function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <div className="admin-modal__title">Confirm Action</div>
        <div className="admin-modal__body">{message}</div>
        <div className="admin-modal__actions">
          <button className="btn-sm btn-sm--gray" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-sm btn-sm--danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function statusBadge(isActive) {
  return isActive ? (
    <span className="badge badge--green">Active</span>
  ) : (
    <span className="badge badge--red">Inactive</span>
  );
}

function verifyBadge(isVerified) {
  return isVerified ? (
    <span className="badge badge--blue">Verified</span>
  ) : (
    <span className="badge badge--yellow">Pending</span>
  );
}

export default function AdminDealers() {
  const [dealers, setDealers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDealers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (filterVerified !== "") params.isVerified = filterVerified;
      const res = await adminAPI.getDealers(params);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setDealers(data.dealers);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterVerified]);

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [search, filterVerified]);

  const runAction = async (action) => {
    setActionLoading(true);
    try {
      await action();
      await fetchDealers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const handleVerify = (dealer, isVerified) => {
    setConfirm({
      message: `${isVerified ? "Verify" : "Unverify"} dealer "${dealer.dealershipName || dealer.name}"?`,
      onConfirm: () =>
        runAction(async () => {
          const res = await adminAPI.verifyDealer(dealer.dealerProfileId, isVerified);
          if (!res.ok) throw new Error("Action failed");
        }),
    });
  };

  const handleToggleActive = (dealer) => {
    const willActivate = !dealer.isActive;
    setConfirm({
      message: `${willActivate ? "Activate" : "Deactivate"} dealer "${dealer.name}"?`,
      onConfirm: () =>
        runAction(async () => {
          const fn = willActivate
            ? adminAPI.activateDealer
            : adminAPI.deactivateDealer;
          const res = await fn(dealer.id);
          if (!res.ok) throw new Error("Action failed");
        }),
    });
  };

  const handleDelete = (dealer) => {
    setConfirm({
      message: `Permanently delete dealer "${dealer.name}" (${dealer.email})? This cannot be undone.`,
      onConfirm: () =>
        runAction(async () => {
          const res = await adminAPI.deleteDealer(dealer.id);
          if (!res.ok) throw new Error("Delete failed");
        }),
    });
  };

  const totalPages = Math.ceil(total / LIMIT);

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
          <h1 className="admin-page-title">Dealers</h1>
          <p className="admin-page-subtitle">{total} dealers total</p>
        </div>
        <button className="btn-sm btn-sm--gray" onClick={fetchDealers} title="Refresh">
          <MdRefresh /> Refresh
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search by name, email, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-filter-select"
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
        >
          <option value="">All Dealers</option>
          <option value="true">Verified</option>
          <option value="false">Pending</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          {loading ? (
            <div className="admin-loading" />
          ) : dealers.length === 0 ? (
            <div className="admin-empty">No dealers found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dealer</th>
                  <th>Email</th>
                  <th>Dealership</th>
                  <th>Location</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dealers.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.name}</strong>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        ID: {d.id}
                      </div>
                    </td>
                    <td>{d.email}</td>
                    <td>{d.dealershipName || "—"}</td>
                    <td>
                      {d.city && d.state ? `${d.city}, ${d.state}` : d.city || d.state || "—"}
                    </td>
                    <td>{verifyBadge(d.isVerified)}</td>
                    <td>{statusBadge(d.isActive)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="admin-actions">
                        {/* Verify / Unverify */}
                        {d.dealerProfileId && (
                          <button
                            className={`btn-icon ${d.isVerified ? "btn-icon--warning" : "btn-icon--success"}`}
                            title={d.isVerified ? "Unverify" : "Verify"}
                            onClick={() => handleVerify(d, !d.isVerified)}
                          >
                            {d.isVerified ? <MdBlock /> : <MdVerified />}
                          </button>
                        )}
                        {/* Activate / Deactivate */}
                        <button
                          className={`btn-icon ${d.isActive ? "btn-icon--warning" : "btn-icon--success"}`}
                          title={d.isActive ? "Deactivate" : "Activate"}
                          onClick={() => handleToggleActive(d)}
                        >
                          {d.isActive ? <MdBlock /> : <MdCheckCircle />}
                        </button>
                        {/* Delete */}
                        <button
                          className="btn-icon btn-icon--danger"
                          title="Delete dealer"
                          onClick={() => handleDelete(d)}
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
            <span>
              Page {page} of {totalPages} — {total} results
            </span>
            <div className="admin-pagination__btns">
              <button
                className="admin-pagination__btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="admin-pagination__btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
