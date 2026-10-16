import React, { useCallback, useEffect, useState } from "react";
import {
  MdDeleteForever,
  MdRefresh,
  MdStar,
  MdStarOutline,
  MdDirectionsCar,
} from "react-icons/md";
import { adminAPI } from "../../api/api";
import "./Admin.css";

const LIMIT = 20;
const STATUS_OPTIONS = ["", "active", "draft", "sold", "reserved", "inactive"];

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

const STATUS_BADGE = {
  active:   "badge--green",
  sold:     "badge--blue",
  draft:    "badge--gray",
  reserved: "badge--yellow",
  inactive: "badge--red",
};

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const res = await adminAPI.getCars(params);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setCars(data.cars);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus]);

  useEffect(() => { fetchCars(); }, [fetchCars]);
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const runAction = async (action) => {
    setActionLoading(true);
    try {
      await action();
      await fetchCars();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const handleStatusChange = (car, newStatus) => {
    setConfirm({
      message: `Change status of "${car.make} ${car.model}" to "${newStatus}"?`,
      onConfirm: () => runAction(async () => {
        const res = await adminAPI.updateCarStatus(car.id, newStatus);
        if (!res.ok) throw new Error("Failed to update status");
      }),
    });
  };

  const handleToggleFeatured = (car) => {
    const newVal = !car.isFeatured;
    setConfirm({
      message: `${newVal ? "Feature" : "Unfeature"} "${car.make} ${car.model}"?`,
      onConfirm: () => runAction(async () => {
        const res = await adminAPI.toggleCarFeatured(car.id, newVal);
        if (!res.ok) throw new Error("Failed to update");
      }),
    });
  };

  const handleDelete = (car) => {
    setConfirm({
      message: `Permanently delete "${car.make} ${car.model} (${car.year})"? All associated images and data will be removed.`,
      onConfirm: () => runAction(async () => {
        const res = await adminAPI.deleteCar(car.id);
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
          <h1 className="admin-page-title">Cars</h1>
          <p className="admin-page-subtitle">{total} cars total</p>
        </div>
        <button className="btn-sm btn-sm--gray" onClick={fetchCars}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search by make, model, reg no, dealer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          {loading ? (
            <div className="admin-loading" />
          ) : cars.length === 0 ? (
            <div className="admin-empty">No cars found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Car</th>
                  <th>Dealer</th>
                  <th>Price</th>
                  <th>KM</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Views</th>
                  <th>Listed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id}>
                    <td>
                      {car.primaryImage ? (
                        <img
                          src={car.primaryImage}
                          alt={`${car.make} ${car.model}`}
                          className="admin-car-thumb"
                        />
                      ) : (
                        <div className="admin-car-thumb--placeholder">
                          <MdDirectionsCar />
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{car.make} {car.model}</strong>
                      {car.variant && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{car.variant}</div>
                      )}
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{car.year}</div>
                    </td>
                    <td>
                      <div>{car.dealerName || "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{car.dealerEmail}</div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      ₹{Number(car.price).toLocaleString("en-IN")}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {Number(car.kilometersDriven).toLocaleString()} km
                    </td>
                    <td>
                      <select
                        className="admin-filter-select"
                        style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                        value={car.status}
                        onChange={(e) => handleStatusChange(car, e.target.value)}
                      >
                        {STATUS_OPTIONS.filter(Boolean).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className={`btn-icon ${car.isFeatured ? "btn-icon--warning" : "btn-icon--gray"}`}
                        title={car.isFeatured ? "Remove from featured" : "Mark as featured"}
                        onClick={() => handleToggleFeatured(car)}
                      >
                        {car.isFeatured ? <MdStar /> : <MdStarOutline />}
                      </button>
                    </td>
                    <td>{car.viewsCount}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(car.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="btn-icon btn-icon--danger"
                          title="Delete car"
                          onClick={() => handleDelete(car)}
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
