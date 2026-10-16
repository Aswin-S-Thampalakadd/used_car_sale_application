import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { carsAPI, statsAPI } from "../../api/api";
import "./Banner.css";

const BUDGET_OPTIONS = [
  { label: "Any Budget",      min: "",        max: "" },
  { label: "Under ₹3 Lakh",  min: "",        max: "300000" },
  { label: "₹3 – 6 Lakh",    min: "300000",  max: "600000" },
  { label: "₹6 – 10 Lakh",   min: "600000",  max: "1000000" },
  { label: "₹10 – 20 Lakh",  min: "1000000", max: "2000000" },
  { label: "Above ₹20 Lakh", min: "2000000", max: "" },
];

const FUEL_OPTIONS = [
  { label: "Any Fuel",  value: "" },
  { label: "Petrol",    value: "petrol" },
  { label: "Diesel",    value: "diesel" },
  { label: "Electric",  value: "electric" },
  { label: "Hybrid",    value: "hybrid" },
  { label: "CNG",       value: "cng" },
];

const STAT_DEFS = [
  { key: "totalCars",     label: "Cars Listed",      suffix: "+", icon: "🚗" },
  { key: "totalDealers",  label: "Verified Dealers", suffix: "+", icon: "✅" },
  { key: "totalCities",   label: "Cities",           suffix: "+", icon: "📍" },
  { key: "averageRating", label: "Avg. Rating",      suffix: "★", icon: "⭐" },
];

const QUICK_TAGS = ["Maruti", "Honda", "Hyundai", "Toyota", "Kia", "Tata"];

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
    <div className="bn-stat-chip">
      <span className="bn-stat-chip-num">
        {display === "—" ? "—" : `${display}${suffix}`}
      </span>
      <span className="bn-stat-chip-label">{label}</span>
    </div>
  );
}

export default function Banner() {
  const navigate = useNavigate();
  const [makes, setMakes]               = useState([]);
  const [keyword, setKeyword]           = useState("");
  const [brand, setBrand]               = useState("");
  const [fuel, setFuel]                 = useState("");
  const [budgetIdx, setBudgetIdx]       = useState(0);
  const [liveStats, setLiveStats]       = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeTab, setActiveTab]       = useState("buy"); // buy | sell
  const statsRef                        = useRef(null);

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
      .then((data) => { if (data.success) setLiveStats(data.stats); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim())  params.set("search",   keyword.trim());
    if (brand)           params.set("make",      brand);
    if (fuel)            params.set("fuelType",  fuel);
    const { min, max } = BUDGET_OPTIONS[budgetIdx];
    if (min) params.set("minPrice", min);
    if (max) params.set("maxPrice", max);
    navigate(`/used-cars${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="bn" aria-label="Hero">

      {/* ── Full-bleed background image ── */}
      <div className="bn-bg" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=90&w=1920&auto=format&fit=crop"
          alt=""
          className="bn-bg-img"
          loading="eager"
          fetchpriority="high"
        />
        {/* layered overlays */}
        <div className="bn-bg-overlay" />
        <div className="bn-bg-vignette" />
      </div>

      {/* ── Hero content ── */}
      <div className="bn-content">

        {/* Label */}
        <div className="bn-eyebrow">
          <span className="bn-eyebrow-dot" aria-hidden="true" />
          India's Most Trusted Used Car Platform
        </div>

        {/* Heading */}
        <h1 className="bn-heading">
          Find Your Perfect
          <br />
          <span className="bn-heading-highlight">Pre-Owned Car</span>
        </h1>

        <p className="bn-subtext">
          Thousands of certified cars. Verified sellers. Unbeatable prices.
        </p>

        {/* ── Buy / Sell tabs ── */}
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

        {/* ── Search box ── */}
        {activeTab === "buy" ? (
          <form className="bn-search" onSubmit={handleSearch} role="search" aria-label="Search cars">

            {/* Keyword */}
            <div className="bn-search-field bn-search-field--keyword">
              <label className="bn-search-label" htmlFor="bn-kw">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                What are you looking for?
              </label>
              <input
                id="bn-kw"
                type="text"
                className="bn-search-input"
                placeholder='e.g. "Honda City 2021"'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                aria-label="Keyword"
              />
            </div>

            <div className="bn-search-sep" aria-hidden="true" />

            {/* Brand */}
            <div className="bn-search-field">
              <label className="bn-search-label" htmlFor="bn-brand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 17H3v-4l2-5h11l3 5v4h-2"/><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/></svg>
                Brand
              </label>
              <select
                id="bn-brand"
                className="bn-search-select"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="bn-search-sep" aria-hidden="true" />

            {/* Fuel */}
            <div className="bn-search-field">
              <label className="bn-search-label" htmlFor="bn-fuel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 22V8l7-6 7 6v14"/><path d="M17 22V12h3l1 4v2a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="6" height="8"/></svg>
                Fuel
              </label>
              <select
                id="bn-fuel"
                className="bn-search-select"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
              >
                {FUEL_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            <div className="bn-search-sep" aria-hidden="true" />

            {/* Budget */}
            <div className="bn-search-field">
              <label className="bn-search-label" htmlFor="bn-budget">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Budget
              </label>
              <select
                id="bn-budget"
                className="bn-search-select"
                value={budgetIdx}
                onChange={(e) => setBudgetIdx(Number(e.target.value))}
              >
                {BUDGET_OPTIONS.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
              </select>
            </div>

            {/* Submit */}
            <button className="bn-search-btn" type="submit" aria-label="Search cars">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span>Search</span>
            </button>

          </form>
        ) : (
          /* Sell CTA */
          <div className="bn-sell-cta">
            <p className="bn-sell-text">
              Get the best price for your car. Free inspection. Fast sale.
            </p>
            <button
              className="bn-sell-btn"
              onClick={() => navigate("/sell")}
              type="button"
            >
              Get Free Valuation
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}

        {/* ── Quick filters ── */}
        <div className="bn-quick" aria-label="Popular brands">
          <span className="bn-quick-label">Popular:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className="bn-quick-tag"
              onClick={() => navigate(`/used-cars?make=${tag}`)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* ── Stats ── */}
        <div className="bn-stats" ref={statsRef} aria-label="Platform stats">
          {STAT_DEFS.map((def, i) => (
            <React.Fragment key={def.key}>
              {i > 0 && <div className="bn-stats-sep" aria-hidden="true" />}
              <StatChip
                statKey={def.key}
                label={def.label}
                suffix={def.suffix}
                icon={def.icon}
                rawValue={liveStats ? liveStats[def.key] : null}
                animate={statsVisible && liveStats !== null}
              />
            </React.Fragment>
          ))}
        </div>

      </div>

      {/* ── Bottom scroll cue ── */}
      <div className="bn-scroll-cue" aria-hidden="true">
        <div className="bn-scroll-mouse">
          <div className="bn-scroll-wheel" />
        </div>
      </div>

    </section>
  );
}
