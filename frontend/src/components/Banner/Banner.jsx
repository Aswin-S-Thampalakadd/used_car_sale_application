import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { carsAPI, statsAPI } from "../../api/api";
import "./Banner.css";
import SearchBox from "../SearchBox/SearchBox";

const BUDGET_OPTIONS = [
  { label: "Any Budget", min: "", max: "" },
  { label: "Under ₹3 Lakh", min: "", max: "300000" },
  { label: "₹3 – 6 Lakh", min: "300000", max: "600000" },
  { label: "₹6 – 10 Lakh", min: "600000", max: "1000000" },
  { label: "₹10 – 20 Lakh", min: "1000000", max: "2000000" },
  { label: "Above ₹20 Lakh", min: "2000000", max: "" },
];

const FUEL_OPTIONS = [
  { label: "Any Fuel", value: "" },
  { label: "Petrol", value: "petrol" },
  { label: "Diesel", value: "diesel" },
  { label: "Electric", value: "electric" },
  { label: "Hybrid", value: "hybrid" },
  { label: "CNG", value: "cng" },
];

const STAT_DEFS = [
  { key: "totalCars", label: "Cars Listed", suffix: "+", icon: "🚗" },
  { key: "totalDealers", label: "Verified Dealers", suffix: "+", icon: "✅" },
  { key: "totalCities", label: "Cities", suffix: "+", icon: "📍" },
];

const QUICK_TAGS = ["Maruti", "Honda", "Hyundai", "Toyota", "Kia", "Tata"];

const HERO_IMG =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=90&w=1400&auto=format&fit=crop";

const PERKS = [
  {
    label: "Verified Dealers",
    d: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM8.5 12l2.5 2.5L16 9.5",
  },
  {
    label: "Transparent Deals",
    d: "M3 12l4-4 4 3 4-3 6 5-5 5-3-2-2 2-8-6zM3 12v5",
  },
  {
    label: "Wide Selection",
    d: "M5 16v-4l2-5h10l2 5v4M5 16h14M5 16v2h3v-2M16 16v2h3v-2M8 12h8",
  },
];

const STAT_ICONS = {
  totalCars: "M5 16v-4l2-5h10l2 5v4M5 16h14M5 16v2h3v-2M16 16v2h3v-2M8 12h8",
  totalDealers:
    "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM8.5 12l2.5 2.5L16 9.5",
  totalCities:
    "M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  averageRating:
    "M12 3l2.7 5.7 6.3.9-4.5 4.4 1 6.3L12 17.3 6.5 20.3l1-6.3L3 9.6l6.3-.9L12 3z",
};

const BRAND_COLORS = {
  Maruti: "#e11d2e",
  Honda: "#475569",
  Hyundai: "#1d3a8a",
  Toyota: "#dc2626",
  Kia: "#111827",
  Tata: "#1d4ed8",
};

function formatNum(key, n) {
  if (n === null || n === undefined) return "—";
  const num = Number(n);
  if (key === "averageRating") return num.toFixed(1);
  if (num >= 1000) {
    const k = num / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return num.toLocaleString("en-IN");
}

function useCountUp(target, duration, enabled) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!enabled || target === null || target === undefined) return;
    const end = Number(target);
    if (!end) return;
    let startTs = null;
    const tick = (ts) => {
      if (!startTs) startTs = ts;
      const pct = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 4);
      setValue(eased >= 1 ? end : end * eased);
      if (pct < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, enabled]);
  return value;
}

function StatChip({ statKey, label, suffix, icon, rawValue, animate }) {
  const animated = useCountUp(rawValue, 1600, animate);
  const display =
    animate && rawValue !== null
      ? formatNum(statKey, animated)
      : formatNum(statKey, rawValue);
  return (
    <div className="bn-stat">
      <svg
        className="bn-stat-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path
          d={STAT_ICONS[statKey]}
          fillOpacity={
            statKey === "averageRating" || statKey === "totalCities" ? 1 : 0.15
          }
        />
      </svg>
      <div className="bn-stat-text">
        <span className="bn-stat-num">
          {display === "—" ? "—" : `${display}${suffix}`}
        </span>
        <span className="bn-stat-label">{label}</span>
      </div>
    </div>
  );
}

export default function Banner() {
  const navigate = useNavigate();
  const [makes, setMakes] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [brand, setBrand] = useState("");
  const [fuel, setFuel] = useState("");
  const [budgetIdx, setBudgetIdx] = useState(0);
  const [liveStats, setLiveStats] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("buy");
  const statsRef = useRef(null);

  useEffect(() => {
    carsAPI
      .getAll({ limit: 200, status: "active" })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.cars || [];
        setMakes([...new Set(list.map((c) => c.make))].sort());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    statsAPI
      .getPlatformStats()
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setLiveStats(data.stats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (brand) params.set("make", brand);
    if (fuel) params.set("fuelType", fuel);
    const { min, max } = BUDGET_OPTIONS[budgetIdx];
    if (min) params.set("minPrice", min);
    if (max) params.set("maxPrice", max);
    navigate(`/used-cars${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="bn" aria-label="Hero">
      <div className="bn-hero">
        <img
          src={HERO_IMG}
          alt=""
          className="bn-hero-img"
          loading="eager"
          fetchpriority="high"
        />
        <div className="bn-hero-fade" aria-hidden="true" />
        <div className="bn-hero-copy">
          <h1 className="bn-heading">
            Find Your
            <br />
            <span className="bn-heading-blue">Perfect Ride</span>
          </h1>
          <p className="bn-subtext">
            Trusted used cars. Better prices. Greater choices.
          </p>
          <ul className="bn-perks">
            {PERKS.map((p) => (
              <li key={p.label}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d={p.d} />
                </svg>
                {p.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bn-body">
        <div className="bn-tabs" role="tablist" aria-label="Mode">
          <button
            role="tab"
            aria-selected={activeTab === "buy"}
            className={`bn-tab ${activeTab === "buy" ? "bn-tab--active" : ""}`}
            onClick={() => setActiveTab("buy")}
          >
            Buy a Car
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "sell"}
            className={`bn-tab ${activeTab === "sell" ? "bn-tab--active" : ""}`}
            onClick={() => setActiveTab("sell")}
          >
            Sell a Car
          </button>
        </div>

        <div className="bn-card">
          {activeTab === "buy" ? (
            <form
              className="bn-search"
              onSubmit={handleSearch}
              role="search"
              aria-label="Search cars"
            >
              <div className="bn-field bn-field--keyword">
                <SearchBox
                  placeholder="Search cars..."
                  variant="banner"
                  onSearch={(q) => setKeyword(q)}
                />
              </div>

              <div className="bn-field">
                <label className="bn-label" htmlFor="bn-brand">
                  Brand
                </label>
                <select
                  id="bn-brand"
                  className="bn-select"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="">Select Brand</option>
                  {makes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bn-field">
                <label className="bn-label" htmlFor="bn-fuel">
                  Fuel
                </label>
                <select
                  id="bn-fuel"
                  className="bn-select"
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                >
                  {FUEL_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bn-field">
                <label className="bn-label" htmlFor="bn-budget">
                  Budget
                </label>
                <select
                  id="bn-budget"
                  className="bn-select"
                  value={budgetIdx}
                  onChange={(e) => setBudgetIdx(Number(e.target.value))}
                >
                  {BUDGET_OPTIONS.map((o, i) => (
                    <option key={i} value={i}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="bn-search-btn"
                type="submit"
                aria-label="Search cars"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span>Search Cars</span>
              </button>
            </form>
          ) : (
            <div className="bn-sell">
              <div>
                <p className="bn-sell-title">Create a Dealer Account</p>
                <p className="bn-sell-text">
                  List your inventory, reach thousands of buyers, and grow your
                  dealership — all from one dashboard.
                </p>
              </div>
              <div className="bn-sell-actions">
                <button
                  className="bn-search-btn"
                  onClick={() => navigate("/signup")}
                  type="button"
                >
                  Register as Dealer
                </button>
                <button
                  className="bn-sell-ghost"
                  onClick={() => navigate("/login")}
                  type="button"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bn-brands" aria-label="Popular brands">
          <span className="bn-brands-title">Popular Brands</span>
          <div className="bn-brands-list">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className="bn-brand"
                onClick={() => navigate(`/used-cars?make=${tag}`)}
              >
                <span
                  className="bn-brand-mark"
                  style={{ background: BRAND_COLORS[tag] }}
                  aria-hidden="true"
                >
                  {tag.charAt(0)}
                </span>
                {tag}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="bn-brands-all"
            onClick={() => navigate("/used-cars")}
          >
            View All Brands
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="bn-bar">
          <div className="bn-stats" ref={statsRef} aria-label="Platform stats">
            {STAT_DEFS.map((def) => (
              <StatChip
                key={def.key}
                statKey={def.key}
                label={def.label}
                suffix={def.suffix}
                icon={def.icon}
                rawValue={liveStats ? liveStats[def.key] : null}
                animate={statsVisible && liveStats !== null}
              />
            ))}
          </div>
          <button
            type="button"
            className="bn-dealer"
            onClick={() => navigate("/signup")}
          >
            <svg
              className="bn-dealer-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9c0 1.7 1.3 3 2.7 3S9.3 10.7 9.3 9c0 1.7 1.3 3 2.7 3s2.7-1.3 2.7-3c0 1.7 1.3 3 2.7 3S20 10.7 20 9M10 20v-5h4v5" />
            </svg>
            <span className="bn-dealer-text">
              <strong>Register as Dealer</strong>
              <small>Grow Your Business with VandiMart</small>
            </span>
            <span className="bn-dealer-arrow" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
