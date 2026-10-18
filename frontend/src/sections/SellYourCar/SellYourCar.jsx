import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { statsAPI } from "../../api/api";
import "./SellYourCar.css";

/* ── format a raw number as "12.4K+" / "50K+" / "500+" etc. ── */
function formatStat(n) {
  if (n === null || n === undefined) return "—";
  const num = Number(n);
  if (num >= 1000) {
    const k = num / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}K+`;
  }
  return `${num.toLocaleString("en-IN")}+`;
}

export default function SellYourCar() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    statsAPI
      .getPlatformStats()
      .then((r) => r.json())
      .then((data) => { if (data.success) setStats(data.stats); })
      .catch(() => {}); // keep null — fallback values used in render
  }, []);

  /* derived display values — show "—" while loading, real data once fetched */
  const carsListed   = stats ? formatStat(stats.totalCars)      : "—";
  const activeBuyers = stats ? formatStat(stats.totalCustomers)  : "—";
  const dealerRating = stats?.averageRating != null
    ? `${Number(stats.averageRating).toFixed(1)}/5`
    : "—";

  return (
    <section className="sell-car" id="sell-your-car">
      <div className="sell-car-banner">
        <div className="sell-car-glow" aria-hidden="true" />

        <div className="sell-car-content">
          <span className="sell-car-eyebrow">For Dealers &amp; Sellers</span>
          <h2 className="sell-car-title">
            List your car and reach thousands of buyers
          </h2>
          <p className="sell-car-subtitle">
            Create a free dealer account, add your listings in minutes, and let
            verified buyers contact you directly — no middlemen, no hidden fees.
          </p>

          <div className="sell-car-ctas">
            <button
              type="button"
              className="sell-car-button"
              onClick={() => navigate("/signup")}
            >
              Create Dealer Account
            </button>
            <button
              type="button"
              className="sell-car-button sell-car-button--outline"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>

          <ul className="sell-car-perks">
            {[
              "Free to list",
              "Direct buyer contact",
              "Manage all listings from dashboard",
            ].map((perk) => (
              <li key={perk} className="sell-car-perk">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div className="sell-car-stats">
          <div className="sell-car-stat">
            <span className="sell-car-stat-value">{carsListed}</span>
            <span className="sell-car-stat-label">Cars listed</span>
          </div>
          <div className="sell-car-stat">
            <span className="sell-car-stat-value">{activeBuyers}</span>
            <span className="sell-car-stat-label">Active buyers</span>
          </div>
          {/* <div className="sell-car-stat">
            <span className="sell-car-stat-value">{dealerRating}</span>
            <span className="sell-car-stat-label">Dealer rating</span>
          </div> */}
        </div>
      </div>
    </section>
  );
}
