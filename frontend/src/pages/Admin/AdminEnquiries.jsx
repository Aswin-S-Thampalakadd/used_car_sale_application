import React, { useCallback, useEffect, useState } from "react";
import { MdRefresh } from "react-icons/md";
import { adminAPI } from "../../api/api";
import "./Admin.css";

const LIMIT = 20;

const STATUS_BADGE = {
  new:       "badge--blue",
  contacted: "badge--yellow",
  closed:    "badge--gray",
};

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (filterStatus) params.status = filterStatus;
      const res = await adminAPI.getEnquiries(params);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setEnquiries(data.enquiries);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);
  useEffect(() => { setPage(1); }, [filterStatus]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Enquiries</h1>
          <p className="admin-page-subtitle">{total} enquiries total</p>
        </div>
        <button className="btn-sm btn-sm--gray" onClick={fetchEnquiries}>
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
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          {loading ? (
            <div className="admin-loading" />
          ) : enquiries.length === 0 ? (
            <div className="admin-empty">No enquiries found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Car</th>
                  <th>Customer ID</th>
                  <th>Dealer ID</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e.id}>
                    <td>#{e.id}</td>
                    <td>
                      {e.carMake && e.carModel
                        ? `${e.carMake} ${e.carModel} (${e.carYear})`
                        : `Car #${e.carId}`}
                    </td>
                    <td>#{e.customerId}</td>
                    <td>#{e.dealerId}</td>
                    <td style={{ maxWidth: 240 }}>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 220,
                          color: e.message ? "inherit" : "#94a3b8",
                        }}
                        title={e.message || ""}
                      >
                        {e.message || "—"}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[e.status] || "badge--gray"}`}>
                        {e.status}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(e.createdAt).toLocaleDateString()}
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
