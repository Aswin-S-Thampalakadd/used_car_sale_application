import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { operatorsAPI } from "../../api/api";

export default function ChangePassword() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await operatorsAPI.changePassword(password);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to change password");
      }
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      stored.mustChangePassword = false;
      localStorage.setItem("user", JSON.stringify(stored));
      navigate("/operator/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Set your password</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Hi <strong>{user?.name}</strong>, your account was created by your dealer. Please set a new password to continue.
          </p>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              required
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Saving…" : "Set Password & Continue"}
          </button>
        </form>

        <button onClick={() => { logout(); navigate("/login"); }} style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
