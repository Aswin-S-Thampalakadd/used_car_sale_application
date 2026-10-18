import React, { useState } from "react";
import "./StaticPage.css";

export default function Contact() {
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmit] = useState(false);
  const [loading, setLoading]  = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submit — replace with real API call if needed
    setTimeout(() => { setLoading(false); setSubmit(true); }, 900);
  };

  return (
    <>
      <div className="sp-hero">
        <span className="sp-hero-eyebrow">Get in Touch</span>
        <h1 className="sp-hero-title">Contact VandiMart</h1>
        <p className="sp-hero-sub">
          Have a question, feedback, or need help with a listing? We're here for you.
        </p>
      </div>

      <div className="sp-body">
        <div className="sp-contact-grid">

          {/* Form */}
          <div>
            <h2 className="sp-section-title">Send us a message</h2>

            {submitted ? (
              <div className="sp-form-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Thanks! We received your message and will reply within 24 hours.
              </div>
            ) : (
              <form className="sp-form" onSubmit={handleSubmit}>
                <div className="sp-form-field">
                  <label className="sp-form-label">Full Name</label>
                  <input className="sp-form-input" type="text" placeholder="Your name"
                    value={form.name} onChange={set("name")} required />
                </div>
                <div className="sp-form-field">
                  <label className="sp-form-label">Email Address</label>
                  <input className="sp-form-input" type="email" placeholder="you@example.com"
                    value={form.email} onChange={set("email")} required />
                </div>
                <div className="sp-form-field">
                  <label className="sp-form-label">Subject</label>
                  <select className="sp-form-select" value={form.subject} onChange={set("subject")} required>
                    <option value="">Select a topic…</option>
                    <option>Listing enquiry</option>
                    <option>Account issue</option>
                    <option>Dealer partnership</option>
                    <option>Report a problem</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="sp-form-field">
                  <label className="sp-form-label">Message</label>
                  <textarea className="sp-form-textarea" placeholder="Tell us how we can help…"
                    value={form.message} onChange={set("message")} required rows={5} />
                </div>
                <button className="sp-form-btn" type="submit" disabled={loading}>
                  {loading ? "Sending…" : (
                    <>
                      Send Message
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="sp-contact-info">
            <h2 className="sp-section-title">Other ways to reach us</h2>

            <div className="sp-contact-block">
              <div className="sp-contact-block-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>
                </svg>
              </div>
              <div>
                <div className="sp-contact-block-title">Email</div>
                <div className="sp-contact-block-text">
                  <a href="mailto:vandimart.support@gmail.com">vandimart.support@gmail.com</a>
                  <br/>We reply within 24 hours on business days.
                </div>
              </div>
            </div>

            <div className="sp-contact-block">
              <div className="sp-contact-block-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <div className="sp-contact-block-title">Based in Kerala</div>
                <div className="sp-contact-block-text">
                  Serving buyers and sellers across Kerala and South India.
                </div>
              </div>
            </div>

            <div className="sp-contact-block">
              <div className="sp-contact-block-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
              <div>
                <div className="sp-contact-block-title">Instagram</div>
                <div className="sp-contact-block-text">
                  <a href="https://www.instagram.com/vandimart.in" target="_blank" rel="noopener noreferrer">
                    @vandimart.in
                  </a>
                  <br/>DM us for quick responses.
                </div>
              </div>
            </div>

            <div className="sp-contact-block">
              <div className="sp-contact-block-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <div className="sp-contact-block-title">Support Hours</div>
                <div className="sp-contact-block-text">
                  Monday – Saturday<br/>9:00 AM – 6:00 PM IST
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
