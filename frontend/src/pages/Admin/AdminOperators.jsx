import React, { useCallback, useEffect, useState } from "react";
import { adminAPI } from "../../api/api";

export default function AdminOperators() {
  const [operators, setOperators] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, search };
      const res = await adminAPI.getOperators(params);
      if (res.ok) {
        const d = await res.json();
        setOperators(d.operators ?? []);
        setTotal(d.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  const toggleActive = async (op) => {
    const res = op.isActive
      ? await adminAPI.deactivateOperator(op.id)
      : await adminAPI.activateOperator(op.id);
    if (res.ok) load();
  };

  const handleDelete = async (op) => {
    if (!window.confirm(`Delete operator ${op.name}? This cannot be undone.`)) return;
    const res = await adminAPI.deleteOperator(op.id);
    if (res.ok) load();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Operators</h1>
          <p className="admin-page-subtitle">{total} total operators across all dealers</p>
        </div>
      </div>

      <div className="admin-filters">
        <div className="admin-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="admin-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Dealer</th>
              <th>Status</th>
              <th>Password</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading…</td></tr>
            ) : operators.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No operators found</td></tr>
            ) : operators.map((op) => (
              <tr key={op.id}>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-user-avatar">{op.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="admin-user-name">{op.name}</p>
                      <p className="admin-user-email">{op.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>{op.dealershipName}</span>
                </td>
                <td>
                  <span className={`admin-badge ${op.isActive ? "admin-badge--success" : "admin-badge--muted"}`}>
                    {op.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  {op.mustChangePassword
                    ? <span className="admin-badge admin-badge--warning">Pending change</span>
                    : <span className="admin-badge admin-badge--success">Set</span>}
                </td>
                <td style={{ fontSize: 13, color: "#64748b" }}>
                  {new Date(op.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td style={{ fontSize: 13, color: "#64748b" }}>
                  {op.lastLoginAt
                    ? new Date(op.lastLoginAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "Never"}
                </td>
                <td>
                  <div className="admin-actions">
                    <button
                      className={`admin-btn admin-btn--sm ${op.isActive ? "admin-btn--warning" : "admin-btn--success"}`}
                      onClick={() => toggleActive(op)}
                    >
                      {op.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(op)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button className="admin-btn admin-btn--sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span style={{ fontSize: 13, color: "#64748b" }}>Page {page} of {totalPages}</span>
          <button className="admin-btn admin-btn--sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
