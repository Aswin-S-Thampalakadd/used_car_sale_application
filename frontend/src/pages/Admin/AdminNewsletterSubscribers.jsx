import React, { useEffect, useState } from "react";
import { newsletterAPI } from "../../api/api";
import "./Admin.css";

const STATUS_COLORS = {
  active:       { bg: "#dcfce7", color: "#15803d" },
  pending:      { bg: "#fef9c3", color: "#854d0e" },
  unsubscribed: { bg: "#f1f5f9", color: "#64748b" },
};

export default function AdminNewsletterSubscribers() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (filter) params.status = filter;
      const res  = await newsletterAPI.getSubscribers(params);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setRows(data.subscribers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Newsletter Subscribers</h1>
          <p className="admin-page-subtitle">{rows.length} subscriber{rows.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn-sm btn-sm--gray" onClick={load}>↻ Refresh</button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-toolbar" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <select className="admin-filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending confirmation</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          {loading ? (
            <div className="admin-loading" />
          ) : rows.length === 0 ? (
            <div className="admin-empty">No subscribers found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Subscribed</th>
                  <th>Confirmed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const sc = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={r.id}>
                      <td style={{ color: "#94a3b8", fontSize: 13 }}>{i + 1}</td>
                      <td><a href={`mailto:${r.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>{r.email}</a></td>
                      <td>{r.name || <span style={{ color: "#94a3b8" }}>—</span>}</td>
                      <td>
                        <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {r.confirmedAt
                          ? new Date(r.confirmedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : <span style={{ color: "#94a3b8" }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
