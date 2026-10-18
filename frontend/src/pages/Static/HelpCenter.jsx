import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./StaticPage.css";

const FAQS = [
  {
    category: "Buying a Car",
    items: [
      {
        q: "How do I know a listing is genuine?",
        a: "Every dealer on VandiMart is verified by our team. Car listings go through a review process before going live. Look for the 'Verified Dealer' badge on listings for extra confidence.",
      },
      {
        q: "Can I test drive a car before buying?",
        a: "Yes. Once you send an enquiry through VandiMart, the dealer will contact you to arrange a viewing and test drive at their location.",
      },
      {
        q: "What documents should I check when buying?",
        a: "Always verify: RC Book (Registration Certificate), Insurance certificate, PUC certificate, No Objection Certificate (if applicable), and service history records.",
      },
      {
        q: "Is there a buyer protection guarantee?",
        a: "VandiMart verifies dealers and reviews listings, but final transactions happen directly between buyer and dealer. We recommend meeting at the dealer's registered location and verifying all documents before payment.",
      },
    ],
  },
  {
    category: "Selling a Car",
    items: [
      {
        q: "How do I list my car on VandiMart?",
        a: "Sign up as a dealer, verify your account, then use the 'Add Listing' button in your dashboard. Fill in the car details, upload photos, and set your price. Your listing goes live after review.",
      },
      {
        q: "How many cars can I list for free?",
        a: "On the Free plan, you can list up to 5 cars. Upgrade to Elite or Pro for more listings and premium visibility.",
      },
      {
        q: "How long does it take for my listing to go live?",
        a: "Most listings are reviewed and published within a few hours. You'll receive a notification once it's live.",
      },
    ],
  },
  {
    category: "Account & Technical",
    items: [
      {
        q: "I forgot my password. How do I reset it?",
        a: "Click 'Log in', then use the 'Forgot password?' link and enter your registered email. You'll receive a reset link within a few minutes.",
      },
      {
        q: "How do I update my contact details?",
        a: "Go to your account settings from the profile dropdown. You can update your name, phone number, and email from there.",
      },
      {
        q: "Why am I not receiving enquiry notifications?",
        a: "Check your spam folder first. Make sure the email address on your account is correct. Contact support if the issue persists.",
      },
    ],
  },
];

function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="sp-accordion">
      {items.map((item, i) => (
        <div key={i} className="sp-accordion-item">
          <button
            className={`sp-accordion-trigger ${open === i ? "sp-accordion-trigger--open" : ""}`}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.q}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {open === i && (
            <div className="sp-accordion-body">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HelpCenter() {
  return (
    <>
      <div className="sp-hero">
        <span className="sp-hero-eyebrow">Help Center</span>
        <h1 className="sp-hero-title">How Can We Help You?</h1>
        <p className="sp-hero-sub">
          Find answers to common questions about buying, selling, and using VandiMart.
        </p>
      </div>

      <div className="sp-body">

        {FAQS.map((section) => (
          <section key={section.category} className="sp-section">
            <h2 className="sp-section-title">{section.category}</h2>
            <Accordion items={section.items} />
          </section>
        ))}

        {/* Still need help */}
        <section className="sp-section" style={{ textAlign: "center" }}>
          <h2 className="sp-section-title" style={{ borderBottom: "none", textAlign: "center" }}>
            Still have questions?
          </h2>
          <p className="sp-text" style={{ textAlign: "center" }}>
            Our support team is available Monday–Saturday, 9 AM–6 PM IST.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/contact" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#1e40af,#2563eb)", color: "#fff",
              padding: "13px 28px", borderRadius: 10, fontWeight: 700,
              fontSize: 14, textDecoration: "none", fontFamily: "var(--font-sans)",
            }}>
              Contact Support
            </Link>
            <a href="mailto:vandimart.support@gmail.com" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#f1f5f9", color: "#0f172a",
              padding: "13px 28px", borderRadius: 10, fontWeight: 700,
              fontSize: 14, textDecoration: "none", fontFamily: "var(--font-sans)",
              border: "1.5px solid #e2e8f0",
            }}>
              Email Us
            </a>
          </div>
        </section>

      </div>
    </>
  );
}
