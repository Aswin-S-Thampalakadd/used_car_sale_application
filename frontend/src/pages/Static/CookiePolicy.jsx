import React from "react";
import "./StaticPage.css";

const COOKIE_TYPES = [
  {
    name: "Strictly Necessary",
    required: true,
    desc: "These cookies are essential for the Platform to function. They enable core features like user authentication and security. They cannot be disabled.",
    examples: "Session tokens, authentication cookies, security cookies.",
  },
  {
    name: "Functional",
    required: false,
    desc: "These cookies remember your preferences (e.g. search filters, saved location) to provide a personalised experience.",
    examples: "Language preference, search filter state, dismissed banners.",
  },
  {
    name: "Analytics",
    required: false,
    desc: "These cookies help us understand how visitors interact with VandiMart, which pages are most popular, and where users encounter issues. Data is aggregated and anonymous.",
    examples: "Page views, session duration, traffic sources.",
  },
  {
    name: "Marketing",
    required: false,
    desc: "We currently do not use third-party advertising or tracking cookies. If this changes, we will update this policy and request fresh consent.",
    examples: "Currently none.",
  },
];

export default function CookiePolicy() {
  return (
    <>
      <div className="sp-hero">
        <span className="sp-hero-eyebrow">Legal</span>
        <h1 className="sp-hero-title">Cookie Policy</h1>
        <p className="sp-hero-sub">
          How and why VandiMart uses cookies and similar technologies.
        </p>
      </div>

      <div className="sp-body">
        <p className="sp-last-updated">Last updated: October 1, 2024</p>

        <section className="sp-section">
          <h2 className="sp-section-title">What Are Cookies?</h2>
          <p className="sp-text">
            Cookies are small text files stored on your device when you visit a website. They allow the website to remember information about your visit, such as your login status and preferences, making your next visit easier and the site more useful to you.
          </p>
        </section>

        <section className="sp-section">
          <h2 className="sp-section-title">Cookies We Use</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
            {COOKIE_TYPES.map((c) => (
              <div key={c.name} style={{
                border: "1.5px solid #e2e8f0", borderRadius: 12,
                padding: "20px 22px", background: "#fff",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{
                    fontWeight: 700, fontSize: 15, color: "#0f172a",
                  }}>{c.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 10px",
                    borderRadius: 999,
                    background: c.required ? "#dcfce7" : "#f1f5f9",
                    color: c.required ? "#15803d" : "#64748b",
                  }}>
                    {c.required ? "Required" : "Optional"}
                  </span>
                </div>
                <p className="sp-text" style={{ marginBottom: 8 }}>{c.desc}</p>
                <p style={{ fontSize: 13, color: "#94a3b8" }}>
                  <strong>Examples:</strong> {c.examples}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="sp-section">
          <h2 className="sp-section-title">How to Control Cookies</h2>
          <p className="sp-text">
            Most browsers allow you to refuse or delete cookies. How you do this depends on your browser — check your browser's help documentation. Note that disabling cookies may affect the functionality of VandiMart.
          </p>
          <p className="sp-text">
            You can also control non-essential cookies using the cookie consent banner shown when you first visit VandiMart. To change your preferences later, clear your browser's local storage or contact us at vandimart.support@gmail.com.
          </p>
        </section>

        <section className="sp-section">
          <h2 className="sp-section-title">Changes to This Policy</h2>
          <p className="sp-text">
            We may update this Cookie Policy as our use of cookies evolves or in response to legal requirements. We will notify you of significant changes via email or through a banner on the Platform.
          </p>
        </section>

        <section className="sp-section">
          <h2 className="sp-section-title">Contact</h2>
          <p className="sp-text">
            Questions? Email us at{" "}
            <a href="mailto:vandimart.support@gmail.com" style={{ color: "#2563eb", fontWeight: 500 }}>
              vandimart.support@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </>
  );
}
