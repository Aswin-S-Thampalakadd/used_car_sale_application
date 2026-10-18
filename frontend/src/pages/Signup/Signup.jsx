import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../Login/Login.css";
import "./Signup.css";

/* ── Icon helpers ── */
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconDealer = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ════════════════════════════════════
   CUSTOMER FORM
════════════════════════════════════ */
const CustomerForm = ({ onSubmit, loading, error }) => {
  const [form, setForm]       = useState({ name: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      className="al-form"
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      noValidate
    >
      {error && (
        <div className="al-error" role="alert">
          <IconAlert />
          {error}
        </div>
      )}

      {/* Full name */}
      <div className="al-field">
        <label htmlFor="c-name" className="al-label">Full Name</label>
        <div className="al-input-wrap">
          <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <input
            id="c-name" type="text" className="al-input"
            value={form.name} onChange={set("name")}
            placeholder="John Doe" required autoComplete="name"
          />
        </div>
      </div>

      {/* Email */}
      <div className="al-field">
        <label htmlFor="c-email" className="al-label">Email Address</label>
        <div className="al-input-wrap">
          <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <input
            id="c-email" type="email" className="al-input"
            value={form.email} onChange={set("email")}
            placeholder="you@example.com" required autoComplete="email"
          />
        </div>
      </div>

      {/* Phone */}
      <div className="al-field">
        <label htmlFor="c-phone" className="al-label">
          Phone
          <span className="al-label-optional">optional</span>
        </label>
        <div className="al-input-wrap">
          <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.42 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <input
            id="c-phone" type="tel" className="al-input"
            value={form.phone} onChange={set("phone")}
            placeholder="9876543210" autoComplete="tel"
          />
        </div>
      </div>

      {/* Password */}
      <div className="al-field">
        <label htmlFor="c-password" className="al-label">Password</label>
        <div className="al-input-wrap">
          <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            id="c-password"
            type={showPass ? "text" : "password"}
            className="al-input"
            value={form.password} onChange={set("password")}
            placeholder="Min. 6 characters" required minLength={6}
            autoComplete="new-password"
          />
          <button
            type="button" className="al-eye-btn"
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
        <p className="al-hint">Use at least 6 characters with a mix of letters and numbers.</p>
      </div>

      <button type="submit" className="al-submit" disabled={loading}>
        {loading ? (
          <><span className="al-spinner" aria-hidden="true" />Creating account…</>
        ) : (
          <>
            Create Customer Account
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </>
        )}
      </button>
    </form>
  );
};

/* ════════════════════════════════════
   DEALER FORM
════════════════════════════════════ */
const DealerForm = ({ onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    dealershipName: "", description: "", address: "",
    city: "", state: "", country: "India", pincode: "", gstNumber: "",
  });
  const [showPass, setShowPass] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      className="al-form"
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      noValidate
    >
      {error && (
        <div className="al-error" role="alert">
          <IconAlert />
          {error}
        </div>
      )}

      {/* ── Personal info ── */}
      <p className="al-section-title">Personal Information</p>

      <div className="al-field">
        <label htmlFor="d-name" className="al-label">Full Name</label>
        <div className="al-input-wrap">
          <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <input id="d-name" type="text" className="al-input" value={form.name} onChange={set("name")} placeholder="John Doe" required autoComplete="name" />
        </div>
      </div>

      <div className="al-row">
        <div className="al-field">
          <label htmlFor="d-email" className="al-label">Email</label>
          <div className="al-input-wrap">
            <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input id="d-email" type="email" className="al-input" value={form.email} onChange={set("email")} placeholder="you@example.com" required autoComplete="email" />
          </div>
        </div>
        <div className="al-field">
          <label htmlFor="d-phone" className="al-label">Phone</label>
          <div className="al-input-wrap">
            <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.42 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <input id="d-phone" type="tel" className="al-input" value={form.phone} onChange={set("phone")} placeholder="9876543210" autoComplete="tel" />
          </div>
        </div>
      </div>

      <div className="al-field">
        <label htmlFor="d-password" className="al-label">Password</label>
        <div className="al-input-wrap">
          <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            id="d-password" type={showPass ? "text" : "password"} className="al-input"
            value={form.password} onChange={set("password")}
            placeholder="Min. 6 characters" required minLength={6} autoComplete="new-password"
          />
          <button type="button" className="al-eye-btn" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Hide" : "Show"}>
            {showPass ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Dealership info ── */}
      <p className="al-section-title">Dealership Information</p>

      <div className="al-field">
        <label htmlFor="d-dealname" className="al-label">Dealership Name</label>
        <input id="d-dealname" type="text" className="al-input-plain" value={form.dealershipName} onChange={set("dealershipName")} placeholder="My Auto Sales" required />
      </div>

      <div className="al-field">
        <label htmlFor="d-desc" className="al-label">
          Description
          <span className="al-label-optional">optional</span>
        </label>
        <textarea id="d-desc" className="al-textarea" value={form.description} onChange={set("description")} placeholder="Tell customers about your dealership…" />
      </div>

      <div className="al-field">
        <label htmlFor="d-address" className="al-label">Street Address</label>
        <div className="al-input-wrap">
          <svg className="al-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <input id="d-address" type="text" className="al-input" value={form.address} onChange={set("address")} placeholder="Street address" />
        </div>
      </div>

      <div className="al-row">
        <div className="al-field">
          <label htmlFor="d-city" className="al-label">City</label>
          <input id="d-city" type="text" className="al-input-plain" value={form.city} onChange={set("city")} placeholder="Kochi" />
        </div>
        <div className="al-field">
          <label htmlFor="d-state" className="al-label">State</label>
          <input id="d-state" type="text" className="al-input-plain" value={form.state} onChange={set("state")} placeholder="Kerala" />
        </div>
      </div>

      <div className="al-row">
        <div className="al-field">
          <label htmlFor="d-pincode" className="al-label">Pincode</label>
          <input id="d-pincode" type="text" className="al-input-plain" value={form.pincode} onChange={set("pincode")} placeholder="682001" />
        </div>
        <div className="al-field">
          <label htmlFor="d-gst" className="al-label">
            GST Number
            <span className="al-label-optional">optional</span>
          </label>
          <input id="d-gst" type="text" className="al-input-plain" value={form.gstNumber} onChange={set("gstNumber")} placeholder="32ABCDE1234F1Z5" />
        </div>
      </div>

      <button type="submit" className="al-submit" disabled={loading}>
        {loading ? (
          <><span className="al-spinner" aria-hidden="true" />Creating account…</>
        ) : (
          <>
            Create Dealer Account
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </>
        )}
      </button>
    </form>
  );
};

/* ════════════════════════════════════
   SIGNUP PAGE
════════════════════════════════════ */
const Signup = () => {
  const { customerSignup, dealerSignup, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]     = useState("customer");
  const [error, setError] = useState("");

  const handleCustomer = async (form) => {
    setError("");
    try {
      await customerSignup(form.name, form.email, form.phone, form.password);
      navigate("/used-cars");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDealer = async (form) => {
    setError("");
    try {
      await dealerSignup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="al-page">

      {/* ── Left panel ── */}
      <div className="al-panel" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=85&w=1200&auto=format&fit=crop"
          alt=""
          className="al-panel-img"
        />
        <div className="al-panel-overlay" />

        <div className="al-panel-content">
          <div className="al-panel-logo">
            <img src="/logo.svg" alt="VandiMart" style={{ height: "38px", width: "auto" }} />
          </div>

          <div className="al-panel-body">
            <h2 className="al-panel-heading">
              Join India's fastest‑growing<br />
              <span className="al-panel-heading-accent">car marketplace.</span>
            </h2>
            <p className="al-panel-sub">
              Whether you're buying your dream car or selling as a dealer — VandiMart makes it simple, fast, and trusted.
            </p>

            {/* Feature list */}
            <ul className="al-panel-features">
              <li>
                <span className="al-panel-feat-icon al-panel-feat-icon--green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                Free account, no credit card needed
              </li>
              <li>
                <span className="al-panel-feat-icon al-panel-feat-icon--blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </span>
                Verified sellers &amp; inspected cars
              </li>
              <li>
                <span className="al-panel-feat-icon al-panel-feat-icon--amber">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </span>
                Instant enquiries &amp; fast responses
              </li>
            </ul>
          </div>

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
      <div className="al-form-panel su-form-panel">
        <div className="al-form-wrap su-form-wrap">

          {/* Mobile logo */}
          <div className="al-mobile-logo">
            <img src="/logo.svg" alt="VandiMart" style={{ height: "34px", width: "auto" }} />
          </div>

          <div className="al-form-header">
            <h1 className="al-form-title">Create your account</h1>
            <p className="al-form-sub">Join thousands of buyers and verified dealers</p>
          </div>

          {/* Tabs */}
          <div className="al-tabs" role="tablist" aria-label="Account type">
            <button
              role="tab"
              aria-selected={tab === "customer"}
              className={`al-tab ${tab === "customer" ? "al-tab--active" : ""}`}
              onClick={() => { setTab("customer"); setError(""); }}
            >
              <IconUser />
              Customer
            </button>
            <button
              role="tab"
              aria-selected={tab === "dealer"}
              className={`al-tab ${tab === "dealer" ? "al-tab--active" : ""}`}
              onClick={() => { setTab("dealer"); setError(""); }}
            >
              <IconDealer />
              Dealer
            </button>
          </div>

          {/* Account type description */}
          <div className="su-tab-desc">
            {tab === "customer" ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Browse, shortlist and enquire about cars from verified dealers.
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
                List your inventory and connect with thousands of buyers.
              </>
            )}
          </div>

          {/* The form */}
          {tab === "customer"
            ? <CustomerForm onSubmit={handleCustomer} loading={loading} error={error} />
            : <DealerForm   onSubmit={handleDealer}   loading={loading} error={error} />
          }

          <p className="al-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Signup;
