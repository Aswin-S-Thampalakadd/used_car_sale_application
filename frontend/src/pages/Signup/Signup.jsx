import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../Login/Login.css";
import "./Signup.css";

const CustomerForm = ({ onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} noValidate>
      {error && (
        <div className="auth-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
      <div className="auth-field">
        <label htmlFor="c-name">Full Name</label>
        <input id="c-name" type="text" value={form.name} onChange={set("name")} placeholder="John Doe" required />
      </div>
      <div className="auth-field">
        <label htmlFor="c-email">Email</label>
        <input id="c-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
      </div>
      <div className="auth-field">
        <label htmlFor="c-phone">Phone (optional)</label>
        <input id="c-phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="9876543210" />
      </div>
      <div className="auth-field">
        <label htmlFor="c-password">Password</label>
        <input id="c-password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 characters" required minLength={6} />
      </div>
      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? "Creating account…" : "Create Customer Account"}
      </button>
    </form>
  );
};

const DealerForm = ({ onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    dealershipName: "", description: "", address: "",
    city: "", state: "", country: "India", pincode: "", gstNumber: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} noValidate>
      {error && (
        <div className="auth-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <p className="auth-section-title">Personal Information</p>

      <div className="auth-field">
        <label htmlFor="d-name">Full Name</label>
        <input id="d-name" type="text" value={form.name} onChange={set("name")} placeholder="John Doe" required />
      </div>
      <div className="auth-row">
        <div className="auth-field">
          <label htmlFor="d-email">Email</label>
          <input id="d-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
        </div>
        <div className="auth-field">
          <label htmlFor="d-phone">Phone</label>
          <input id="d-phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="9876543210" />
        </div>
      </div>
      <div className="auth-field">
        <label htmlFor="d-password">Password</label>
        <input id="d-password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 characters" required minLength={6} />
      </div>

      <p className="auth-section-title">Dealership Information</p>

      <div className="auth-field">
        <label htmlFor="d-dealname">Dealership Name</label>
        <input id="d-dealname" type="text" value={form.dealershipName} onChange={set("dealershipName")} placeholder="My Auto Sales" required />
      </div>
      <div className="auth-field">
        <label htmlFor="d-desc">Description (optional)</label>
        <textarea id="d-desc" value={form.description} onChange={set("description")} placeholder="Tell customers about your dealership…" />
      </div>
      <div className="auth-field">
        <label htmlFor="d-address">Address</label>
        <input id="d-address" type="text" value={form.address} onChange={set("address")} placeholder="Street address" />
      </div>
      <div className="auth-row">
        <div className="auth-field">
          <label htmlFor="d-city">City</label>
          <input id="d-city" type="text" value={form.city} onChange={set("city")} placeholder="Kochi" />
        </div>
        <div className="auth-field">
          <label htmlFor="d-state">State</label>
          <input id="d-state" type="text" value={form.state} onChange={set("state")} placeholder="Kerala" />
        </div>
      </div>
      <div className="auth-row">
        <div className="auth-field">
          <label htmlFor="d-pincode">Pincode</label>
          <input id="d-pincode" type="text" value={form.pincode} onChange={set("pincode")} placeholder="682001" />
        </div>
        <div className="auth-field">
          <label htmlFor="d-gst">GST Number (optional)</label>
          <input id="d-gst" type="text" value={form.gstNumber} onChange={set("gstNumber")} placeholder="32ABCDE1234F1Z5" />
        </div>
      </div>

      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? "Creating account…" : "Create Dealer Account"}
      </button>
    </form>
  );
};

const Signup = () => {
  const { customerSignup, dealerSignup, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("customer");
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
    <div className="auth-page signup-page">
      <div className="auth-card signup-card">
        <div className="auth-logo">Wheelz<span>Loop</span></div>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Join thousands of buyers and sellers</p>

        <div className="auth-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "customer"} className={`auth-tab ${tab === "customer" ? "active" : ""}`} onClick={() => { setTab("customer"); setError(""); }}>
            Customer
          </button>
          <button role="tab" aria-selected={tab === "dealer"} className={`auth-tab ${tab === "dealer" ? "active" : ""}`} onClick={() => { setTab("dealer"); setError(""); }}>
            Dealer
          </button>
        </div>

        {tab === "customer"
          ? <CustomerForm onSubmit={handleCustomer} loading={loading} error={error} />
          : <DealerForm onSubmit={handleDealer} loading={loading} error={error} />}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
