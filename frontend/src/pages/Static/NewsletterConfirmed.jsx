import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./StaticPage.css";

const STATUS = {
  ok: {
    emoji: "🎉",
    title: "You're subscribed!",
    body:  "Thanks for confirming. You'll now receive the best used car deals and tips from VandiMart directly in your inbox.",
    cta:   "Browse Cars",
    href:  "/used-cars",
    color: "#10b981",
  },
  unsubscribed: {
    emoji: "👋",
    title: "You've been unsubscribed.",
    body:  "You won't receive newsletter emails from VandiMart anymore. You can always re-subscribe from our footer.",
    cta:   "Go to Home",
    href:  "/",
    color: "#64748b",
  },
  invalid: {
    emoji: "⚠️",
    title: "Link expired or already used.",
    body:  "This confirmation link has already been used or has expired. If you need help, contact us at vandimart.support@gmail.com.",
    cta:   "Go to Home",
    href:  "/",
    color: "#f59e0b",
  },
  error: {
    emoji: "❌",
    title: "Something went wrong.",
    body:  "We couldn't process your request. Please try again or contact vandimart.support@gmail.com.",
    cta:   "Go to Home",
    href:  "/",
    color: "#ef4444",
  },
};

export default function NewsletterConfirmed() {
  const [params] = useSearchParams();
  const status   = params.get("status") || "ok";
  const s        = STATUS[status] || STATUS.ok;

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 64, lineHeight: 1 }}>{s.emoji}</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
          {s.title}
        </h1>
        <p style={{ fontSize: 16, color: "#4b5563", lineHeight: 1.7, margin: 0, maxWidth: 380 }}>
          {s.body}
        </p>
        <Link to={s.href} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg,#1e40af,#2563eb)",
          color: "#fff", padding: "13px 28px", borderRadius: 10,
          fontWeight: 700, fontSize: 14, textDecoration: "none",
          fontFamily: "var(--font-sans)", marginTop: 8,
        }}>
          {s.cta}
        </Link>
      </div>
    </div>
  );
}
