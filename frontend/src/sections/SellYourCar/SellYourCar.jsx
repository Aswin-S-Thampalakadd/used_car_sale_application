import { useNavigate } from "react-router-dom";
import "./SellYourCar.css";

export default function SellYourCar() {
  const navigate = useNavigate();

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
            <span className="sell-car-stat-value">12,400+</span>
            <span className="sell-car-stat-label">Cars listed</span>
          </div>
          <div className="sell-car-stat">
            <span className="sell-car-stat-value">50K+</span>
            <span className="sell-car-stat-label">Active buyers</span>
          </div>
          <div className="sell-car-stat">
            <span className="sell-car-stat-value">4.8/5</span>
            <span className="sell-car-stat-label">Dealer rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
