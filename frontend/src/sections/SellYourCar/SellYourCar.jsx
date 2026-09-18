import { useState } from "react";
import "./SellYourCar.css";

export default function SellYourCar({ onSubmit }) {
  const [regNumber, setRegNumber] = useState("");

  const handleSubmit = () => {
    const value = regNumber.trim().toUpperCase();
    if (!value) return;
    if (onSubmit) onSubmit(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <section className="sell-car" id="sell-your-car">
      <div className="sell-car-banner">
        <div className="sell-car-glow" aria-hidden="true" />

        <div className="sell-car-content">
          <span className="sell-car-eyebrow">For Sellers</span>
          <h2 className="sell-car-title">
            Sell your car for what it&apos;s actually worth
          </h2>
          <p className="sell-car-subtitle">
            Enter your registration number and get a free, data-backed valuation
            in under 60 seconds. No dealer haggling, no listing fees.
          </p>

          <div className="sell-car-form">
            <div className="sell-car-field">
              <label className="sell-car-label" htmlFor="reg-number">
                Registration number
              </label>
              <input
                id="reg-number"
                className="sell-car-input"
                type="text"
                placeholder="KL 13 AB 1234"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              className="sell-car-button"
              onClick={handleSubmit}
            >
              Get Instant Valuation
            </button>
          </div>

          <ul className="sell-car-perks">
            <li className="sell-car-perk">
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
              Free valuation
            </li>
            <li className="sell-car-perk">
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
              Payment in 24 hours
            </li>
            <li className="sell-car-perk">
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
              We handle the paperwork
            </li>
          </ul>
        </div>

        <div className="sell-car-stats">
          <div className="sell-car-stat">
            <span className="sell-car-stat-value">12,400+</span>
            <span className="sell-car-stat-label">Cars sold</span>
          </div>
          <div className="sell-car-stat">
            <span className="sell-car-stat-value">₹48K</span>
            <span className="sell-car-stat-label">Avg. above dealer offer</span>
          </div>
          <div className="sell-car-stat">
            <span className="sell-car-stat-value">4.8/5</span>
            <span className="sell-car-stat-label">Seller rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
