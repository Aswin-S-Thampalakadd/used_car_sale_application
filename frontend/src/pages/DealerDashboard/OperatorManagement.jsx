import React, { useCallback, useEffect, useState } from "react";
import { operatorsAPI } from "../../api/api";

const ConfirmModal = ({ title, body, onConfirm, onCancel, danger = true }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
    <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px 28px", maxWidth: 400, width: "100%", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
      <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700 }}>{title}</h3>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{body}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: "#f1f5f9", color: "#475569", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>Cancel</button>
        {onConfirm && (
          <button onClick={onConfirm} style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: danger ? "#ef4444" : "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>Confirm</button>
        )}
      </div>
    </div>
  </div>
);

export default function OperatorManagement() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await operatorsAPI.getAll();
      if (res.ok) {
        const d = await res.json();
        setOperators(d.operators ?? []);
      }
    } catch { setError("Failed to load operators."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await operatorsAPI.create(form);
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed to create operator");
      setForm({ name: "", email: "", password: "" });
      setShowCreate(false);
      load();
    } catch (err) { setError(err.message); }
    finally { setCreating(false); }
  };

  const handleToggle = async (op) => {
    try {
      const res = op.isActive ? await operatorsAPI.deactivate(op.operatorProfileId) : await operatorsAPI.activate(op.operatorProfileId);
      if (res.ok) load();
    } catch { setError("Action failed."); }
    setConfirm(null);
  };

  const handleDelete = async (op) => {
    try {
      const res = await operatorsAPI.delete(op.operatorProfileId);
      if (res.ok) load();
    } catch { setError("Delete failed."); }
    setConfirm(null);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    try {
      const res = await operatorsAPI.resetPassword(resetTarget.operatorProfileId, newPassword);
      if (res.ok) { setResetTarget(null); setNewPassword(""); }
      else { const d = await res.json(); setError(d.message); }
    } catch { setError("Reset failed."); }
  };

  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Operators</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Manage staff accounts that can add and edit listings on your behalf.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Operator
        </button>
      </div>

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 14, display: "flex", justifyContent: "space-between" }}>{error}<button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>×</button></div>}

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>New Operator</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Full Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="John Doe" required style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="operator@example.com" required style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Temporary Password</label>
            <input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Share this with the operator" required minLength={6} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>The operator will be asked to change this password on first login.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setShowCreate(false)} style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>Cancel</button>
            <button type="submit" disabled={creating} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit", opacity: creating ? 0.7 : 1 }}>{creating ? "Creating…" : "Create Operator"}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Loading…</div>
      ) : operators.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
          <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: "#0f172a" }}>No operators yet</p>
          <p style={{ margin: 0, fontSize: 14 }}>Create an operator account to delegate listing management.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {operators.map((op) => (
            <div key={op.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: op.isActive ? "#eff6ff" : "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: op.isActive ? "#2563eb" : "#94a3b8", flexShrink: 0 }}>
                {op.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "#0f172a" }}>{op.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b" }}>{op.email}</p>
                {op.mustChangePassword && <span style={{ fontSize: 11, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", borderRadius: 6, padding: "1px 8px", marginTop: 4, display: "inline-block" }}>Awaiting password change</span>}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: op.isActive ? "#f0fdf4" : "#f8fafc", color: op.isActive ? "#16a34a" : "#94a3b8" }}>
                {op.isActive ? "Active" : "Inactive"}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setConfirm({ op, action: op.isActive ? "deactivate" : "activate" })} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: op.isActive ? "#f59e0b" : "#16a34a", fontFamily: "inherit" }}>
                  {op.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => { setResetTarget(op); setNewPassword(""); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#2563eb", fontFamily: "inherit" }}>Reset Password</button>
                <button onClick={() => setConfirm({ op, action: "delete" })} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#ef4444", fontFamily: "inherit" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.action === "delete" ? "Delete operator?" : confirm.action === "deactivate" ? "Deactivate operator?" : "Activate operator?"}
          body={confirm.action === "delete"
            ? `This will permanently delete ${confirm.op.name}'s account.`
            : `${confirm.op.name} will ${confirm.action === "deactivate" ? "lose" : "regain"} access to the operator dashboard.`}
          onConfirm={() => confirm.action === "delete" ? handleDelete(confirm.op) : handleToggle(confirm.op)}
          onCancel={() => setConfirm(null)}
          danger={confirm.action === "delete"}
        />
      )}

      {resetTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", maxWidth: 400, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>Reset Password</h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#64748b" }}>Set a new temporary password for <strong>{resetTarget.name}</strong>. They will be asked to change it on next login.</p>
            <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New temporary password" minLength={6} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, marginBottom: 20, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setResetTarget(null)} style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: "#f1f5f9", color: "#475569", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleResetPassword} style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Reset Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
