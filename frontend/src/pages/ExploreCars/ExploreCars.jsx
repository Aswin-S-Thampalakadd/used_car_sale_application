import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { carsAPI } from "../../api/api";
import "./ExploreCars.css";

const ITEMS_PER_PAGE = 9;

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatKm = (km) => `${Number(km).toLocaleString("en-IN")} km`;

const FUEL_OPTIONS = ["petrol", "diesel", "electric", "hybrid", "cng", "lpg"];
const TRANSMISSION_OPTIONS = ["manual", "automatic", "amt", "cvt", "dct"];
const CONDITION_OPTIONS = ["excellent", "good", "fair"];

const Spinner = () => (
  <div className="explore-spinner" aria-label="Loading">
    <div className="explore-spinner-ring" />
  </div>
);

const ExploreCars = () => {
  const location = useLocation();

  // ── Filter state ─────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [selectedFuel, setSelectedFuel] = useState([]);
  const [selectedTransmission, setSelectedTransmission] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [maxKm, setMaxKm] = useState("");
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ── Data state ───────────────────────────────────────────
  const [cars, setCars] = useState([]);
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const isFirstMount = useRef(true);

  // ── Parse URL params on first load ──────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("search")) setSearch(params.get("search"));
    if (params.get("fuelType")) setSelectedFuel([params.get("fuelType")]);
    if (params.get("transmission")) setSelectedTransmission([params.get("transmission")]);
    if (params.get("make")) setSelectedMakes([params.get("make")]);
    if (params.get("isFeatured") === "true") setFeaturedOnly(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load makes once ──────────────────────────────────────
  useEffect(() => {
    carsAPI.getAll({ limit: 200, status: "active" })
      .then((r) => r.json())
      .then((data) => {
        const allCars = Array.isArray(data) ? data : (data.cars || []);
        const uniqueMakes = [...new Set(allCars.map((c) => c.make))].sort();
        setMakes(uniqueMakes);
      })
      .catch(() => {});
  }, []);

  // ── Map sort UI value → API params ──────────────────────
  const sortParams = useMemo(() => {
    switch (sortBy) {
      case "price-asc":   return { sortBy: "price",           sortOrder: "asc" };
      case "price-desc":  return { sortBy: "price",           sortOrder: "desc" };
      case "year-desc":   return { sortBy: "year",            sortOrder: "desc" };
      case "year-asc":    return { sortBy: "year",            sortOrder: "asc" };
      case "km-asc":      return { sortBy: "kilometersDriven", sortOrder: "asc" };
      case "km-desc":     return { sortBy: "kilometersDriven", sortOrder: "desc" };
      case "popular":     return { sortBy: "viewsCount",      sortOrder: "desc" };
      default:            return { sortBy: "createdAt",       sortOrder: "desc" };
    }
  }, [sortBy]);

  // ── Fetch from API ───────────────────────────────────────
  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        status: "active",
        ...sortParams,
      };

      if (search.trim())         params.search = search.trim();
      if (selectedMakes.length === 1)    params.make = selectedMakes[0];
      if (selectedFuel.length === 1)     params.fuelType = selectedFuel[0];
      if (selectedTransmission.length === 1) params.transmission = selectedTransmission[0];
      if (selectedCondition.length === 1)    params.condition = selectedCondition[0];
      if (minPrice)              params.minPrice = minPrice;
      if (maxPrice)              params.maxPrice = maxPrice;
      if (minYear)               params.minYear = minYear;
      if (maxYear)               params.maxYear = maxYear;
      if (maxKm)                 params.maxKm = maxKm;
      if (negotiableOnly)        params.isNegotiable = "true";
      if (featuredOnly)          params.isFeatured = "true";

      const res = await carsAPI.getAll(params);
      if (!res.ok) throw new Error("Failed to load cars");
      const data = await res.json();

      // API returns array or { cars: [] }
      const list = Array.isArray(data) ? data : (data.cars || []);
      setCars(list);
      setTotal(data.total ?? list.length);
    } catch (err) {
      setError("Failed to load cars. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    page, sortParams, search, selectedMakes, selectedFuel,
    selectedTransmission, selectedCondition, minPrice, maxPrice,
    minYear, maxYear, maxKm, negotiableOnly, featuredOnly,
  ]);

  // ── Reset page when filters change ──────────────────────
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    setPage(1);
  }, [
    search, selectedMakes, selectedFuel, selectedTransmission,
    selectedCondition, minPrice, maxPrice, minYear, maxYear,
    maxKm, negotiableOnly, featuredOnly, sortBy,
  ]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // ── Helpers ──────────────────────────────────────────────
  const toggleInArray = (arr, setArr, value) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const clearAllFilters = () => {
    setSearch(""); setSelectedMakes([]); setSelectedFuel([]);
    setSelectedTransmission([]); setSelectedCondition([]);
    setMinPrice(""); setMaxPrice(""); setMinYear(""); setMaxYear("");
    setMaxKm(""); setNegotiableOnly(false); setFeaturedOnly(false);
  };

  const activeFilterCount =
    selectedMakes.length + selectedFuel.length +
    selectedTransmission.length + selectedCondition.length +
    (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) +
    (minYear ? 1 : 0) + (maxYear ? 1 : 0) + (maxKm ? 1 : 0) +
    (negotiableOnly ? 1 : 0) + (featuredOnly ? 1 : 0);

  // Calculate pages — server knows total, fallback to list length
  const totalPages = Math.max(1, Math.ceil((total || cars.length) / ITEMS_PER_PAGE));

  return (
    <div className="explore">
      <div className="explore-container">
        <header className="explore-header">
          <div className="explore-header-text">
            <h1 className="explore-title">Explore Used Cars</h1>
            <p className="explore-subtitle">
              {loading ? "Loading…" : `${total || cars.length} car${(total || cars.length) !== 1 ? "s" : ""} found`}
            </p>
          </div>

          <div className="explore-header-controls">
            <div className="explore-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by make, model or reg. no."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search cars"
              />
            </div>

            <div className="explore-sort">
              <label htmlFor="sortBy" className="explore-sort-label">Sort by</label>
              <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="popular">Most Viewed</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="year-desc">Year: Newest</option>
                <option value="year-asc">Year: Oldest</option>
                <option value="km-asc">KM: Low to High</option>
                <option value="km-desc">KM: High to Low</option>
              </select>
            </div>

            <button
              type="button"
              className="explore-filter-toggle"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="explore-filter-count">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </header>

        <div className="explore-body">
          {/* ── Sidebar filters ── */}
          <aside className={`explore-filters ${filtersOpen ? "open" : ""}`}>
            <div className="explore-filters-header">
              <h2 className="explore-filters-title">Filters</h2>
              {activeFilterCount > 0 && (
                <button type="button" className="explore-filters-clear" onClick={clearAllFilters}>
                  Clear all
                </button>
              )}
              <button type="button" className="explore-filters-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Availability</h3>
              <label className="explore-checkbox">
                <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
                <span>Featured only</span>
              </label>
              <label className="explore-checkbox">
                <input type="checkbox" checked={negotiableOnly} onChange={(e) => setNegotiableOnly(e.target.checked)} />
                <span>Negotiable only</span>
              </label>
            </div>

            {makes.length > 0 && (
              <div className="explore-filter-group">
                <h3 className="explore-filter-heading">Make</h3>
                <div className="explore-filter-options">
                  {makes.map((m) => (
                    <label key={m} className="explore-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedMakes.includes(m)}
                        onChange={() => toggleInArray(selectedMakes, setSelectedMakes, m)}
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Price Range (₹)</h3>
              <div className="explore-range">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} aria-label="Minimum price" />
                <span className="explore-range-sep">—</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} aria-label="Maximum price" />
              </div>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Year</h3>
              <div className="explore-range">
                <input type="number" placeholder="From" value={minYear} onChange={(e) => setMinYear(e.target.value)} aria-label="Minimum year" />
                <span className="explore-range-sep">—</span>
                <input type="number" placeholder="To" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} aria-label="Maximum year" />
              </div>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Max KM Driven</h3>
              <input
                type="number"
                className="explore-single-input"
                placeholder="e.g. 50000"
                value={maxKm}
                onChange={(e) => setMaxKm(e.target.value)}
                aria-label="Maximum kilometers"
              />
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Fuel Type</h3>
              <div className="explore-chip-group">
                {FUEL_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`explore-chip ${selectedFuel.includes(f) ? "active" : ""}`}
                    onClick={() => toggleInArray(selectedFuel, setSelectedFuel, f)}
                    style={{ textTransform: "capitalize" }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Transmission</h3>
              <div className="explore-chip-group">
                {TRANSMISSION_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`explore-chip ${selectedTransmission.includes(t) ? "active" : ""}`}
                    onClick={() => toggleInArray(selectedTransmission, setSelectedTransmission, t)}
                    style={{ textTransform: "uppercase" }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Condition</h3>
              <div className="explore-chip-group">
                {CONDITION_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`explore-chip ${selectedCondition.includes(c) ? "active" : ""}`}
                    onClick={() => toggleInArray(selectedCondition, setSelectedCondition, c)}
                    style={{ textTransform: "capitalize" }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="explore-filters-apply" onClick={() => setFiltersOpen(false)}>
              Show results
            </button>
          </aside>

          {filtersOpen && (
            <div className="explore-filters-backdrop" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
          )}

          {/* ── Main results ── */}
          <main className="explore-results">
            {loading ? (
              <div className="explore-loading-state">
                <Spinner />
                <p>Loading cars…</p>
              </div>
            ) : error ? (
              <div className="explore-error-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button type="button" onClick={fetchCars} className="explore-empty-btn">Try again</button>
              </div>
            ) : cars.length === 0 ? (
              <div className="explore-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <h3>No cars match your filters</h3>
                <p>Try adjusting your search or clearing some filters.</p>
                <button type="button" onClick={clearAllFilters} className="explore-empty-btn">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="explore-grid">
                  {cars.map((car) => {
                    const primaryImage =
                      (car.carImages || []).find((img) => img.isPrimary) ||
                      (car.carImages || [])[0];
                    return (
                      <article className="car-card" key={car.id}>
                        <a
                          href={`/used-cars/${car.id}`}
                          className="car-card-link"
                          aria-label={`View ${car.year} ${car.make} ${car.model}`}
                        >
                          <div className="car-card-image">
                            {primaryImage ? (
                              <img
                                src={primaryImage.imageUrl}
                                alt={`${car.year} ${car.make} ${car.model}`}
                                loading="lazy"
                              />
                            ) : (
                              <div className="car-card-no-image">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                              </div>
                            )}
                            <div className="car-card-badges">
                              {car.isFeatured && (
                                <span className="car-card-badge car-card-badge-featured">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                                  </svg>
                                  Featured
                                </span>
                              )}
                              {car.isNegotiable && (
                                <span className="car-card-badge car-card-badge-negotiable">Negotiable</span>
                              )}
                            </div>
                            {(car.carImages || []).length > 0 && (
                              <span className="car-card-images-count">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                                {(car.carImages || []).length}
                              </span>
                            )}
                          </div>

                          <div className="car-card-body">
                            <div className="car-card-title-block">
                              <h3 className="car-card-title">
                                {car.year} {car.make} {car.model}
                              </h3>
                              <p className="car-card-variant">{car.variant}</p>
                            </div>

                            <ul className="car-card-specs">
                              <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                                {formatKm(car.kilometersDriven)}
                              </li>
                              <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 3v18h18" /><path d="m7 14 4-4 4 4 5-6" />
                                </svg>
                                <span className="car-card-spec-cap">{car.fuelType}</span>
                              </li>
                              <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="3" />
                                  <path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08 4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08 4.24-4.24" />
                                </svg>
                                <span className="car-card-spec-cap">{car.transmission}</span>
                              </li>
                            </ul>

                            <div className="car-card-footer">
                              <div className="car-card-price">{formatPrice(car.price)}</div>
                              <span className="car-card-cta">
                                View
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </a>
                      </article>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <nav className="explore-pagination" aria-label="Pagination">
                    <button
                      type="button"
                      className="explore-page-btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label="Previous page"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === "..." ? (
                          <span key={`ellipsis-${idx}`} className="explore-page-ellipsis">…</span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            className={`explore-page-btn ${page === p ? "active" : ""}`}
                            onClick={() => setPage(p)}
                            aria-current={page === p ? "page" : undefined}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      type="button"
                      className="explore-page-btn"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      aria-label="Next page"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </nav>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ExploreCars;
