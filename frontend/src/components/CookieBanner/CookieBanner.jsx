import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./CookieBanner.css";

const STORAGE_KEY = "vandimart_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if user hasn't made a choice yet
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Small delay so it doesn't flash immediately on load
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cb-wrap" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <div className="cb-inner">
        <div className="cb-icon" aria-hidden="true">🍪</div>

        <div className="cb-content">
          <p className="cb-title">We use cookies</p>
          <p className="cb-text">
            VandiMart uses cookies to improve your experience, remember your preferences, and analyse traffic.
            Read our{" "}
            <Link to="/cookies" className="cb-link" onClick={accept}>
              Cookie Policy
            </Link>{" "}
            for details.
          </p>
        </div>

        <div className="cb-actions">
          <button className="cb-btn cb-btn--accept" onClick={accept}>
            Accept all
          </button>
          <button className="cb-btn cb-btn--decline" onClick={decline}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
