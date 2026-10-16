import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { customerLogin, dealerLogin, loading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]           = useState("customer");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (tab === "dealer") {
        await dealerLogin(email, password);
        navigate("/dashboard");
      } else {
        await customerLogin(email, password);
        navigate("/used-cars");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="al-page">

      {/* ── Left panel ── */}
      <div className="al-panel" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=85&w=1200&auto=format&fit=crop"
          alt=""
          className="al-panel-img"
        />
        <div className="al-panel-overlay" />

        <div className="al-panel-content">
          <div className="al-panel-logo">
            Wheelz<span>Loop</span>
          </div>

          <div className="al-panel-body">
            <h2 className="al-panel-heading">
              Your next car<br />is waiting for you.
            </h2>
            <p className="al-panel-sub">
              Browse thousands of certified pre‑owned cars from verified dealers across India.
            </p>

            <div className="al-panel-stats">
              <div className="al-panel-stat">
                <span className="al-panel-stat-num">50K+</span>
                <span className="al-panel-stat-lbl">Happy Buyers</span>
              </div>
              <div className="al-panel-stat-sep" />
              <div className="al-panel-stat">
                <span className="al-panel-stat-num">200+</span>
                <span className="al-panel-stat-lbl">Verified Dealers</span>
              </div>
              <div className="al-panel-stat-sep" />
              <div className="al-panel-stat">
                <span className="al-panel-stat-num">30+</span>
                <span className="al-panel-stat-lbl">Cities</span>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="al-panel-badges">
            <div className="al-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Secure &amp; Verified
            </div>
            <div className="al-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              No Hidden Fees
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="al-form-panel">
        <div className="al-form-wrap">

          {/* Mobile logo */}
          <div className="al-mobile-logo">
            Wheelz<span>Loop</span>
          </div>

          <div className="al-form-header">
            <h1 className="al-form-title">Welcome back</h1>
            <p className="al-form-sub">Sign in to continue to your account</p>
          </div>

          {/* Tabs */}
          <div className="al-tabs" role="tablist" aria-label="Account type">
            <button
              role="tab"
              aria-selected={tab === "customer"}
              className={`al-tab ${tab === "customer" ? "al-tab--active" : ""}`}
              onClick={() => { setTab("customer"); setError(""); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Customer
            </button>
            <button
              role="tab"
              aria-selected={tab === "dealer"}
              className={`al-tab ${tab === "dealer" ? "al-tab--active" : ""}`}
              onClick={() => { setTab("dealer"); setError(""); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
              Dealer
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="al-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="al-form" onSubmit={handleSubmit} noValidate>

            <div className="al-field">
              <label htmlFor="al-email" className="al-label">Email address</label>
              <div className="al-input-wrap">
                <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  id="al-email"
                  type="email"
                  className="al-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="al-field">
              <label htmlFor="al-password" className="al-label">Password</label>
              <div className="al-input-wrap">
                <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="al-password"
                  type={showPass ? "text" : "password"}
                  className="al-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="al-eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="al-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="al-spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in as {tab === "dealer" ? "Dealer" : "Customer"}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="al-footer">
            Don't have an account?{" "}
            <Link to="/signup">Create one free</Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;
