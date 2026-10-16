import React, { useCallback, useEffect, useState } from "react";
import {
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
          <button className="btn-sm btn-sm--gray" onClick={onCancel}>Cancel</button>
          <button className="btn-sm btn-sm--danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      const res = await adminAPI.getCustomers(params);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setCustomers(data.customers);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { setPage(1); }, [search]);

  const runAction = async (action) => {
    setActionLoading(true);
    try {
      await action();
      await fetchCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const handleToggleActive = (c) => {
    const willActivate = !c.isActive;
    setConfirm({
      message: `${willActivate ? "Activate" : "Deactivate"} customer "${c.name}"?`,
      onConfirm: () => runAction(async () => {
        const fn = willActivate ? adminAPI.activateCustomer : adminAPI.deactivateCustomer;
        const res = await fn(c.id);
        if (!res.ok) throw new Error("Action failed");
      }),
    });
  };

  const handleDelete = (c) => {
    setConfirm({
      message: `Permanently delete customer "${c.name}" (${c.email})? This cannot be undone.`,
      onConfirm: () => runAction(async () => {
        const res = await adminAPI.deleteCustomer(c.id);
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
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-subtitle">{total} customers total</p>
        </div>
        <button className="btn-sm btn-sm--gray" onClick={fetchCustomers}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search by name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          {loading ? (
            <div className="admin-loading" />
          ) : customers.length === 0 ? (
            <div className="admin-empty">No customers found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Email Verified</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: {c.id}</div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone || "—"}</td>
                    <td>
                      {c.emailVerified
                        ? <span className="badge badge--green">Yes</span>
                        : <span className="badge badge--gray">No</span>}
                    </td>
                    <td>
                      {c.isActive
                        ? <span className="badge badge--green">Active</span>
                        : <span className="badge badge--red">Inactive</span>}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className={`btn-icon ${c.isActive ? "btn-icon--warning" : "btn-icon--success"}`}
                          title={c.isActive ? "Deactivate" : "Activate"}
                          onClick={() => handleToggleActive(c)}
                        >
                          {c.isActive ? <MdBlock /> : <MdCheckCircle />}
                        </button>
                        <button
                          className="btn-icon btn-icon--danger"
                          title="Delete customer"
                          onClick={() => handleDelete(c)}
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
              <button className="admin-pagination__btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="admin-pagination__btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
