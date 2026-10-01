import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { customerLogin, dealerLogin, loading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("customer"); // "customer" | "dealer"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          Wheelz<span>Loop</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "customer"}
            className={`auth-tab ${tab === "customer" ? "active" : ""}`}
            onClick={() => { setTab("customer"); setError(""); }}
          >
            Customer
          </button>
          <button
            role="tab"
            aria-selected={tab === "dealer"}
            className={`auth-tab ${tab === "dealer" ? "active" : ""}`}
            onClick={() => { setTab("dealer"); setError(""); }}
          >
            Dealer
          </button>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : `Sign in as ${tab === "dealer" ? "Dealer" : "Customer"}`}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
