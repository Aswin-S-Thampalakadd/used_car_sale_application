import React, { useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-newsletter">
        <div className="footer-container">
          <div className="footer-newsletter-inner">
            <div className="footer-newsletter-text">
              <h3 className="footer-newsletter-title">
                Get the best deals in your inbox
              </h3>
              <p className="footer-newsletter-desc">
                New listings, price drops, and buying tips — once a week, no
                spam.
              </p>
            </div>

            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <div className="footer-newsletter-input-wrap">
                <svg
                  className="footer-newsletter-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 5L2 7" />
                </svg>
                <input
                  type="email"
                  className="footer-newsletter-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address"
                />
              </div>
              <button type="submit" className="footer-newsletter-btn">
                Subscribe
              </button>
            </form>

            {subscribed && (
              <p className="footer-newsletter-success">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Thanks for subscribing!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="/" className="footer-logo" aria-label="Home">
                <span className="footer-logo-mark">UC</span>
                <span className="footer-logo-text">UsedCars</span>
              </a>
              <p className="footer-brand-desc">
                The trusted marketplace for buying and selling quality pre-owned
                vehicles. Every car verified, every deal transparent.
              </p>

              <div className="footer-contact">
                <a href="tel:+18005551234" className="footer-contact-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +1 (800) 555-1234
                </a>
                <a
                  href="mailto:support@usedcars.com"
                  className="footer-contact-item"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 5L2 7" />
                  </svg>
                  support@usedcars.com
                </a>
                <span className="footer-contact-item footer-contact-address">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  500 Market St, San Francisco, CA
                </span>
              </div>
            </div>

            <nav className="footer-column" aria-labelledby="footer-buy-heading">
              <h4 id="footer-buy-heading" className="footer-column-title">
                Buy
              </h4>
              <ul className="footer-links">
                <li>
                  <a href="/used-cars/all">All Used Cars</a>
                </li>
                <li>
                  <a href="/used-cars/brands">Browse by Brand</a>
                </li>
                <li>
                  <a href="/used-cars/cities">Browse by City</a>
                </li>
                <li>
                  <a href="/used-cars/featured">Featured Listings</a>
                </li>
                <li>
                  <a href="/used-cars/under-10k">Under $10,000</a>
                </li>
                <li>
                  <a href="/financing">Financing Options</a>
                </li>
              </ul>
            </nav>

            <nav
              className="footer-column"
              aria-labelledby="footer-sell-heading"
            >
              <h4 id="footer-sell-heading" className="footer-column-title">
                Sell
              </h4>
              <ul className="footer-links">
                <li>
                  <a href="/sell">Sell Your Car</a>
                </li>
                <li>
                  <a href="/sell/valuation">Instant Valuation</a>
                </li>
                <li>
                  <a href="/sell/inspection">Free Inspection</a>
                </li>
                <li>
                  <a href="/sell/dealer">Dealer Program</a>
                </li>
                <li>
                  <a href="/sell/pricing">Pricing</a>
                </li>
              </ul>
            </nav>

            <nav
              className="footer-column"
              aria-labelledby="footer-company-heading"
            >
              <h4 id="footer-company-heading" className="footer-column-title">
                Company
              </h4>
              <ul className="footer-links">
                <li>
                  <a href="/about">About Us</a>
                </li>
                <li>
                  <a href="/careers">Careers</a>
                </li>
                <li>
                  <a href="/blog">Blog</a>
                </li>
                <li>
                  <a href="/press">Press</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
                <li>
                  <a href="/help">Help Center</a>
                </li>
              </ul>
            </nav>

            <nav
              className="footer-column"
              aria-labelledby="footer-legal-heading"
            >
              <h4 id="footer-legal-heading" className="footer-column-title">
                Legal
              </h4>
              <ul className="footer-links">
                <li>
                  <a href="/terms">Terms of Service</a>
                </li>
                <li>
                  <a href="/privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="/cookies">Cookie Policy</a>
                </li>
                <li>
                  <a href="/accessibility">Accessibility</a>
                </li>
                <li>
                  <a href="/sitemap">Sitemap</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-inner">
            <p className="footer-copyright">
              &copy; {currentYear} UsedCars Inc. All rights reserved.
            </p>

            <div className="footer-socials" aria-label="Follow us">
              <a
                href="https://facebook.com"
                className="footer-social"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                className="footer-social"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                className="footer-social"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                className="footer-social"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                className="footer-social"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
              </a>
            </div>

            <div className="footer-badges">
              <span className="footer-badge">SSL Secured</span>
              <span className="footer-badge">Verified Dealers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
