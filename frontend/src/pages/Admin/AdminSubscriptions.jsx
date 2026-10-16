import React, { useCallback, useEffect, useState } from "react";
import { MdRefresh } from "react-icons/md";
import { adminAPI } from "../../api/api";
import "./Admin.css";

const LIMIT = 20;

const STATUS_BADGE = {
  active:    "badge--green",
  expired:   "badge--gray",
  cancelled: "badge--red",
};

const PLAN_BADGE = {
  free:  "badge--gray",
  elite: "badge--blue",
  pro:   "badge--purple",
};

const PAYMENT_BADGE = {
  completed: "badge--green",
  pending:   "badge--yellow",
  failed:    "badge--red",
};

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (filterStatus) params.status = filterStatus;
      if (filterPlan) params.planType = filterPlan;
      const res = await adminAPI.getSubscriptions(params);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setSubscriptions(data.subscriptions);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterPlan]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);
  useEffect(() => { setPage(1); }, [filterStatus, filterPlan]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Subscriptions</h1>
          <p className="admin-page-subtitle">{total} subscriptions total</p>
        </div>
        <button className="btn-sm btn-sm--gray" onClick={fetchSubscriptions}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-toolbar">
        <select
          className="admin-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="admin-filter-select"
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="elite">Elite</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          {loading ? (
            <div className="admin-loading" />
          ) : subscriptions.length === 0 ? (
            <div className="admin-empty">No subscriptions found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dealer</th>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Car Limit</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Order ID</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td>
                      <div>{s.userName || "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.userEmail}</div>
                    </td>
                    <td>
                      <span className={`badge ${PLAN_BADGE[s.planType] || "badge--gray"}`}>
                        {s.planType}
                      </span>
                    </td>
                    <td>
                      {Number(s.price) === 0
                        ? <span style={{ color: "#64748b" }}>Free</span>
                        : `₹${Number(s.price).toLocaleString("en-IN")}`}
                    </td>
                    <td>{s.carLimit}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[s.status] || "badge--gray"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${PAYMENT_BADGE[s.paymentStatus] || "badge--gray"}`}>
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(s.startDate).toLocaleDateString()}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {s.endDate ? new Date(s.endDate).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ maxWidth: 140 }}>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 130,
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                        title={s.razorpayOrderId || ""}
                      >
                        {s.razorpayOrderId || "—"}
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
