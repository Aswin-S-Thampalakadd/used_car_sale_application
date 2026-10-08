import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { carsAPI } from "../../api/api";
import "./Banner.css";

const BUDGET_OPTIONS = [
  { label: "Any Budget",        min: "",         max: "" },
  { label: "Under ₹3 Lakh",    min: "",         max: "300000" },
  { label: "₹3 – 6 Lakh",      min: "300000",   max: "600000" },
  { label: "₹6 – 10 Lakh",     min: "600000",   max: "1000000" },
  { label: "₹10 – 20 Lakh",    min: "1000000",  max: "2000000" },
  { label: "Above ₹20 Lakh",   min: "2000000",  max: "" },
];

const FUEL_OPTIONS = [
  { label: "Any Fuel",  value: "" },
  { label: "Petrol",    value: "petrol" },
  { label: "Diesel",    value: "diesel" },
  { label: "Electric",  value: "electric" },
  { label: "Hybrid",    value: "hybrid" },
  { label: "CNG",       value: "cng" },
];

const STATS = [
  { number: "12,000+", label: "Cars Listed" },
  { number: "500+",    label: "Verified Dealers" },
  { number: "200+",    label: "Cities Covered" },
  { number: "4.8★",    label: "Customer Rating" },
];

// Animated counter hook
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    if (!num) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(pct * num));
      if (pct < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

function StatItem({ stat, animate }) {
  const raw = parseFloat(stat.number.replace(/[^0-9.]/g, ""));
  const suffix = stat.number.replace(/[0-9.,]/g, "");
  const count = useCountUp(animate ? stat.number : "0");
  const display = animate
    ? `${count.toLocaleString("en-IN")}${suffix}`
    : stat.number;
  return (
    <div className="bn-stat">
      <span className="bn-stat-number">{display}</span>
      <span className="bn-stat-label">{stat.label}</span>
    </div>
  );
}

function Banner() {
  const navigate = useNavigate();

  const [makes, setMakes]       = useState([]);
  const [keyword, setKeyword]   = useState("");
  const [brand, setBrand]       = useState("");
  const [fuel, setFuel]         = useState("");
  const [budgetIdx, setBudgetIdx] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // Fetch unique makes
  useEffect(() => {
    carsAPI.getAll({ limit: 200, status: "active" })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.cars || []);
        setMakes([...new Set(list.map((c) => c.make))].sort());
      })
      .catch(() => {});
  }, []);

  // Trigger counter animation when stats scroll into view
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (brand)          params.set("make", brand);
    if (fuel)           params.set("fuelType", fuel);
    const { min, max } = BUDGET_OPTIONS[budgetIdx];
    if (min) params.set("minPrice", min);
    if (max) params.set("maxPrice", max);
    navigate(`/used-cars${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="bn">
      {/* ── Decorative blobs ── */}
      <div className="bn-blob bn-blob--1" aria-hidden="true" />
      <div className="bn-blob bn-blob--2" aria-hidden="true" />

      <div className="bn-inner">
        {/* ── Left column ── */}
        <div className="bn-left">
          <div className="bn-trust-pill">
            <span className="bn-trust-dot" />
            Trusted by 50,000+ Happy Buyers
          </div>

          <h1 className="bn-heading">
            Drive Home Your{" "}
            <span className="bn-heading-accent">
              Dream Car
              <svg className="bn-underline-svg" viewBox="0 0 220 12" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 8 Q55 2 110 8 Q165 14 218 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
            </span>{" "}
            Without Breaking the Bank
          </h1>

          <p className="bn-subtext">
            Explore thousands of certified pre-owned cars from verified dealers.
            Best prices, full transparency, zero hassle.
          </p>

          {/* ── Search card ── */}
          <form className="bn-search-card" onSubmit={handleSearch} role="search" aria-label="Search cars">
            {/* Keyword bar */}
            <div className="bn-keyword-row">
              <div className="bn-keyword-wrap">
                <svg className="bn-keyword-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  className="bn-keyword-input"
                  placeholder='Try "Honda City 2021" or "Electric under 10L"'
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  aria-label="Keyword search"
                />
                {keyword && (
                  <button
                    type="button"
                    className="bn-keyword-clear"
                    onClick={() => setKeyword("")}
                    aria-label="Clear keyword"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filter row */}
            <div className="bn-filter-row">
              <div className="bn-filter-field">
                <label htmlFor="bn-brand" className="bn-filter-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                  Brand
                </label>
                <select
                  id="bn-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="bn-filter-select"
                >
                  <option value="">All Brands</option>
                  {makes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="bn-filter-divider" aria-hidden="true" />

              <div className="bn-filter-field">
                <label htmlFor="bn-fuel" className="bn-filter-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 22V8l7-6 7 6v14"/>
                    <path d="M17 22V12h3l1 4v2a2 2 0 0 1-2 2h-2"/>
                    <rect x="7" y="14" width="6" height="8"/>
                  </svg>
                  Fuel Type
                </label>
                <select
                  id="bn-fuel"
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  className="bn-filter-select"
                >
                  {FUEL_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="bn-filter-divider" aria-hidden="true" />

              <div className="bn-filter-field">
                <label htmlFor="bn-budget" className="bn-filter-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  Budget
                </label>
                <select
                  id="bn-budget"
                  value={budgetIdx}
                  onChange={(e) => setBudgetIdx(Number(e.target.value))}
                  className="bn-filter-select"
                >
                  {BUDGET_OPTIONS.map((o, i) => (
                    <option key={i} value={i}>{o.label}</option>
                  ))}
                </select>
              </div>

              <button className="bn-search-btn" type="submit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Search
              </button>
            </div>
          </form>

          {/* ── Quick tags ── */}
          <div className="bn-quick-tags" aria-label="Quick searches">
            <span className="bn-quick-label">Popular:</span>
            {["Maruti", "Honda", "Hyundai", "Toyota", "Electric"].map((tag) => (
              <button
                key={tag}
                type="button"
                className="bn-quick-tag"
                onClick={() => {
                  if (tag === "Electric") {
                    setFuel("electric");
                  } else {
                    setBrand(tag);
                  }
                  navigate(
                    tag === "Electric"
                      ? "/used-cars?fuelType=electric"
                      : `/used-cars?make=${tag}`
                  );
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* ── Stats ── */}
          <div className="bn-stats" ref={statsRef}>
            {STATS.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="bn-stats-divider" aria-hidden="true" />}
                <StatItem stat={s} animate={statsVisible} />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="bn-right" aria-hidden="true">
          {/* Floating badges */}
          <div className="bn-float bn-float--tl">
            <div className="bn-float-icon bn-float-icon--green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <div>
              <div className="bn-float-title">Verified Seller</div>
              <div className="bn-float-sub">200-point inspected</div>
            </div>
          </div>

          <div className="bn-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1200&auto=format&fit=crop"
              alt="Certified pre-owned car"
              className="bn-img"
            />
            {/* Gradient overlay at bottom */}
            <div className="bn-img-gradient" />
          </div>

          <div className="bn-float bn-float--br">
            <div>
              <div className="bn-float-sub">Starting from</div>
              <div className="bn-float-price">₹1.5 Lakh</div>
            </div>
            <div className="bn-float-icon bn-float-icon--amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>

          {/* Scattered decorative dots */}
          <div className="bn-dots" />
        </div>
      </div>
    </section>
  );
}

export default Banner;
