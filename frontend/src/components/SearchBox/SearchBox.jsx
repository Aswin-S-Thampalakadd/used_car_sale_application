import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { carsAPI } from "../../api/api";
import { carSlug } from "../../utils/carSlug";
import "./SearchBox.css";

const formatPrice = (v) => {
  const num = Number(v);
  if (isNaN(num)) return "";
  const lakh = num / 100000;
  return num >= 100000
    ? `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(1)} L`
    : `₹${num.toLocaleString("en-IN")}`;
};

const formatKm = (v) => {
  const km = Number(v);
  return km >= 1000 ? `${(km / 1000).toFixed(0)}k km` : `${km} km`;
};

export default function SearchBox({
  placeholder = "Search make, model or keyword…",
  className = "",
  inputClass = "",
  onSearch,
  variant = "header",
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await carsAPI.getAll({
        search: q.trim(),
        limit: 8,
        status: "active",
      });
      const data = await res.json();
      const list = data.cars || [];
      setResults(list);
      setOpen(list.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActive(-1);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (active >= 0 && results[active]) {
      navigateToCar(results[active]);
      return;
    }
    if (!query.trim()) return;
    closeDropdown();
    if (onSearch) {
      onSearch(query.trim());
    } else {
      navigate(`/used-cars?search=${encodeURIComponent(query.trim())}`);
    }
    setQuery("");
  };

  const navigateToCar = (car) => {
    closeDropdown();
    setQuery("");
    navigate(carSlug(car));
  };

  const closeDropdown = () => {
    setOpen(false);
    setActive(-1);
  };

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        closeDropdown();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((p) => Math.min(p + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((p) => Math.max(p - 1, -1));
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  };

  const primaryImage = (car) =>
    (car.carImages || []).find((i) => i.isPrimary) || (car.carImages || [])[0];

  return (
    <div ref={wrapRef} className={`sb-wrap sb-wrap--${variant} ${className}`}>
      <form
        className="sb-form"
        onSubmit={handleSubmit}
        role="search"
        autoComplete="off"
      >
        <svg
          className="sb-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          className={`sb-input ${inputClass}`}
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          aria-label="Search cars"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="sb-dropdown"
          autoComplete="off"
          spellCheck="false"
        />

        {loading && <span className="sb-spinner" aria-label="Searching…" />}

        {query && !loading && (
          <button
            type="button"
            className="sb-clear"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </form>

      {open && results.length > 0 && (
        <ul
          id="sb-dropdown"
          className="sb-dropdown"
          role="listbox"
          aria-label="Search suggestions"
        >
          {results.map((car, idx) => {
            const img = primaryImage(car);
            return (
              <li
                key={car.id}
                role="option"
                aria-selected={idx === active}
                className={`sb-item ${idx === active ? "sb-item--active" : ""}`}
                onMouseEnter={() => setActive(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  navigateToCar(car);
                }}
              >
                <div className="sb-item-img">
                  {img ? (
                    <img src={img.imageUrl} alt="" loading="lazy" />
                  ) : (
                    <div className="sb-item-img-placeholder">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="sb-item-body">
                  <span className="sb-item-title">
                    {car.year} {car.make} {car.model}
                    {car.variant && (
                      <span className="sb-item-variant"> {car.variant}</span>
                    )}
                  </span>
                  <span className="sb-item-meta">
                    <span className="sb-item-price">
                      {formatPrice(car.price)}
                    </span>
                    <span className="sb-item-dot">·</span>
                    <span>{formatKm(car.kilometersDriven)}</span>
                    <span className="sb-item-dot">·</span>
                    <span style={{ textTransform: "capitalize" }}>
                      {car.fuelType}
                    </span>
                  </span>
                </div>

                <svg
                  className="sb-item-arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </li>
            );
          })}

          <li
            className="sb-footer"
            role="option"
            aria-selected="false"
            onMouseDown={(e) => {
              e.preventDefault();
              closeDropdown();
              navigate(`/used-cars?search=${encodeURIComponent(query.trim())}`);
              setQuery("");
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            See all results for <strong>"{query}"</strong>
          </li>
        </ul>
      )}
    </div>
  );
}
