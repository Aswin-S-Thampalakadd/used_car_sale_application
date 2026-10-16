import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdminPanelSettings } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

export default function AdminLogin() {
  const { adminLogin, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await adminLogin(form.email, form.password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-card__brand">
          <MdAdminPanelSettings />
        </div>
        <h1 className="admin-login-card__title">Admin Sign In</h1>
        <p className="admin-login-card__sub">Used Car Sale — Control Panel</p>

        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-form__group">
            <label className="admin-form__label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              className="admin-form__input"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="admin-form__input"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="admin-form__submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
