import React from "react";
import "./Banner.css";

function Banner() {
  return (
    <section className="banner">
      <div className="banner-content">
        <div className="banner-text">
          <span className="banner-tag">Trusted by 50,000+ Buyers</span>
          <h1 className="banner-heading">
            Find Your Perfect <span className="highlight">Used Car</span> Today
          </h1>
          <p className="banner-subtext">
            Certified quality, verified sellers, and the best prices on
            pre-owned cars near you.
          </p>

          <div className="banner-search">
            <div className="search-field">
              <label>Brand</label>
              <select>
                <option>All Brands</option>
                <option>Maruti Suzuki</option>
                <option>Hyundai</option>
                <option>Honda</option>
                <option>Toyota</option>
                <option>Tata</option>
              </select>
            </div>
            <div className="search-field">
              <label>Model</label>
              <select>
                <option>All Models</option>
                <option>Swift</option>
                <option>i20</option>
                <option>City</option>
                <option>Creta</option>
              </select>
            </div>
            <div className="search-field">
              <label>Budget</label>
              <select>
                <option>Any Price</option>
                <option>Under ₹3 Lakh</option>
                <option>₹3 - 6 Lakh</option>
                <option>₹6 - 10 Lakh</option>
                <option>Above ₹10 Lakh</option>
              </select>
            </div>
            <button className="search-cta">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search Cars
            </button>
          </div>

          <div className="banner-stats">
            <div className="stat-item">
              <span className="stat-number">12,000+</span>
              <span className="stat-label">Cars Listed</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">200+</span>
              <span className="stat-label">Cities Covered</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">4.8★</span>
              <span className="stat-label">Customer Rating</span>
            </div>
          </div>
        </div>

        <div className="banner-media">
          <div className="banner-badge">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
            200-Point Inspected
          </div>
          <img
            src="https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1200&auto=format&fit=crop"
            alt="Used car"
            className="banner-img"
          />
          <div className="banner-price-tag">
            <span className="price-label">Starting from</span>
            <span className="price-value">₹1.5 Lakh</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
