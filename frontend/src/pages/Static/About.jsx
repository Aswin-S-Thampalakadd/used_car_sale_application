import React from "react";
import { Link } from "react-router-dom";
import "./StaticPage.css";

const STATS = [
  { num: "10K+",  label: "Cars Listed" },
  { num: "500+",  label: "Verified Dealers" },
  { num: "30+",   label: "Cities" },
  { num: "50K+",  label: "Happy Buyers" },
];

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Transparency",
    text: "Every listing is verified. Every price is honest. No hidden charges, no surprises.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Community First",
    text: "Built for buyers, dealers, and sellers across Kerala. Local trust at every step.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: "Speed & Simplicity",
    text: "List your car in minutes. Find your next ride in hours. No paperwork maze.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: "Quality Assured",
    text: "Every car on VandiMart goes through a stringent 200-point quality check.",
  },
];

const TEAM = [
  { name: "Arun Kumar",    role: "Co-Founder & CEO",     initials: "AK" },
  { name: "Divya Nair",    role: "Co-Founder & CTO",     initials: "DN" },
  { name: "Sreejith Menon",role: "Head of Operations",   initials: "SM" },
  { name: "Priya Thomas",  role: "Head of Marketing",    initials: "PT" },
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <div className="sp-hero">
        <span className="sp-hero-eyebrow">About VandiMart</span>
        <h1 className="sp-hero-title">Kerala's Most Trusted<br />Used Car Marketplace</h1>
        <p className="sp-hero-sub">
          We started VandiMart with one mission — make buying and selling used cars in Kerala simple, honest, and stress-free.
        </p>
      </div>

      <div className="sp-body">

        {/* Stats */}
        <div className="sp-stats">
          {STATS.map((s) => (
            <div key={s.label} className="sp-stat">
              <span className="sp-stat-num">{s.num}</span>
              <span className="sp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Our Story */}
        <section className="sp-section">
          <h2 className="sp-section-title">Our Story</h2>
          <p className="sp-lead">
            VandiMart was founded in 2023 by a group of car enthusiasts who were frustrated with the opaque, high-pressure used car market in Kerala.
          </p>
          <p className="sp-text">
            We saw buyers overpaying for cars with hidden problems, and sellers underpricing because they had no trusted platform to reach genuine buyers. We built VandiMart to fix that — a transparent, technology-driven marketplace where both sides win.
          </p>
          <p className="sp-text">
            Today, VandiMart connects thousands of buyers with verified dealers and individual sellers across 30+ cities in Kerala. Every listing is reviewed, every dealer is verified, and every transaction is supported by our dedicated team.
          </p>
          <div className="sp-highlight">
            Our vision: Make VandiMart the most trusted name in pre-owned vehicles across South India.
          </div>
        </section>

        {/* Values */}
        <section className="sp-section">
          <h2 className="sp-section-title">What We Stand For</h2>
          <div className="sp-cards">
            {VALUES.map((v) => (
              <div key={v.title} className="sp-card">
                <div className="sp-card-icon">{v.icon}</div>
                <div className="sp-card-title">{v.title}</div>
                <div className="sp-card-text">{v.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="sp-section">
          <h2 className="sp-section-title">Meet the Team</h2>
          <p className="sp-text">
            We're a passionate team of engineers, designers, and automotive enthusiasts based in Kerala.
          </p>
          <div className="sp-team">
            {TEAM.map((m) => (
              <div key={m.name} className="sp-team-card">
                <div className="sp-team-avatar">{m.initials}</div>
                <div className="sp-team-name">{m.name}</div>
                <div className="sp-team-role">{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="sp-section" style={{ textAlign: "center" }}>
          <h2 className="sp-section-title" style={{ borderBottom: "none", textAlign: "center" }}>
            Ready to find your next car?
          </h2>
          <p className="sp-text" style={{ textAlign: "center" }}>
            Browse thousands of certified pre-owned cars from verified dealers near you.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/used-cars" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#1e40af,#2563eb)",
              color: "#fff", padding: "13px 28px", borderRadius: 10,
              fontWeight: 700, fontSize: 14, textDecoration: "none",
              fontFamily: "var(--font-sans)"
            }}>
              Browse Cars
            </Link>
            <Link to="/contact" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#f1f5f9", color: "#0f172a",
              padding: "13px 28px", borderRadius: 10,
              fontWeight: 700, fontSize: 14, textDecoration: "none",
              fontFamily: "var(--font-sans)", border: "1.5px solid #e2e8f0"
            }}>
              Contact Us
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
