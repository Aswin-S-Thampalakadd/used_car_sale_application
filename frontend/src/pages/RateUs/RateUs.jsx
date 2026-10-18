import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { reviewsAPI } from "../../api/api";
import "./RateUs.css";

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

const StarButton = ({ value, active, hovered, onHover, onLeave, onClick }) => (
  <button
    type="button"
    className={`ru-star ${active || hovered ? "ru-star--on" : ""}`}
    onMouseEnter={() => onHover(value)}
    onMouseLeave={onLeave}
    onClick={() => onClick(value)}
    aria-label={`${value} star${value !== 1 ? "s" : ""} — ${STAR_LABELS[value]}`}
  >
    <svg viewBox="0 0 24 24" fill={active || hovered ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </button>
);

const ASPECTS = [
  { id: "easy_to_use",     label: "Easy to use" },
  { id: "good_selection",  label: "Good car selection" },
  { id: "trusted_dealers", label: "Trusted dealers" },
  { id: "fast_response",   label: "Fast responses" },
  { id: "best_price",      label: "Best prices" },
  { id: "recommend",       label: "Would recommend" },
];

export default function RateUs() {
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();

  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [comment,   setComment]   = useState("");
  const [aspects,   setAspects]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleAspect = (id) =>
    setAspects((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    setError("");
    setLoading(true);
    try {
      const res  = await reviewsAPI.createAppReview({ rating, comment });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review.");
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Not logged in ── */
  if (!isAuthenticated) {
    return (
      <div className="ru-page">
        <div className="ru-auth-wall">
          <div className="ru-auth-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h1 className="ru-auth-title">Share your experience</h1>
          <p className="ru-auth-sub">
            Sign in to rate VandiMart and help other buyers make confident decisions.
          </p>
          <div className="ru-auth-btns">
            <Link to="/login" className="ru-auth-btn ru-auth-btn--primary">Sign in</Link>
            <Link to="/signup" className="ru-auth-btn ru-auth-btn--outline">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not a customer (dealer/admin) ── */
  if (!isCustomer) {
    return (
      <div className="ru-page">
        <div className="ru-auth-wall">
          <div className="ru-auth-icon ru-auth-icon--info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="ru-auth-title">Reviews are for customers</h1>
          <p className="ru-auth-sub">Only registered customers can leave a platform review.</p>
          <Link to="/" className="ru-auth-btn ru-auth-btn--primary">Go to home</Link>
        </div>
      </div>
    );
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="ru-page">
        <div className="ru-success">
          <div className="ru-success-icon">
            <svg viewBox="0 0 52 52" aria-hidden="true">
              <circle className="ru-success-circle" cx="26" cy="26" r="25" fill="none"/>
              <path  className="ru-success-check"  fill="none" d="M14 27 l8 8 16-16"/>
            </svg>
          </div>
          <h1 className="ru-success-title">Thank you for your review!</h1>
          <p className="ru-success-sub">
            Your feedback helps thousands of car buyers trust VandiMart.
          </p>
          <div className="ru-success-rating">
            {[1,2,3,4,5].map((s) => (
              <svg key={s} viewBox="0 0 24 24" fill={s <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
          <div className="ru-success-btns">
            <Link to="/used-cars" className="ru-auth-btn ru-auth-btn--primary">Browse Cars</Link>
            <Link to="/" className="ru-auth-btn ru-auth-btn--outline">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const displayRating = hovered || rating;

  return (
    <div className="ru-page">
      {/* ── Left panel (decorative) ── */}
      <div className="ru-panel" aria-hidden="true">
        <div className="ru-panel-bg" />
        <div className="ru-panel-content">
          <div className="ru-panel-logo">
            <img src="/logo.svg" alt="VandiMart" style={{ height: "36px", width: "auto", filter: "brightness(0) invert(1)" }} />
          </div>
          <h2 className="ru-panel-heading">
            Your voice shapes<br/>our platform.
          </h2>
          <p className="ru-panel-sub">
            Every review helps us build a more trusted, transparent marketplace for car buyers across India.
          </p>
          <div className="ru-panel-quotes">
            {[
              { text: "Found my dream car in 3 days!", author: "Rahul S." },
              { text: "Best prices, zero hidden fees.", author: "Priya M." },
              { text: "Dealers actually respond fast.", author: "Arjun K." },
            ].map((q) => (
              <div key={q.author} className="ru-panel-quote">
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <p className="ru-panel-quote-text">"{q.text}"</p>
                <span className="ru-panel-quote-author">— {q.author}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="ru-form-panel">
        <div className="ru-form-wrap">

          {/* Mobile logo */}
          <div className="ru-mobile-logo">
            <img src="/logo.svg" alt="VandiMart" style={{ height: "34px", width: "auto" }} />
          </div>

          <div className="ru-form-header">
            <h1 className="ru-form-title">Rate your experience</h1>
            <p className="ru-form-sub">
              How was your experience with VandiMart? Your honest feedback matters.
            </p>
          </div>

          <form className="ru-form" onSubmit={handleSubmit} noValidate>

            {/* Star picker */}
            <div className="ru-stars-block">
              <div className="ru-stars-row">
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarButton
                    key={s}
                    value={s}
                    active={s <= rating}
                    hovered={s <= hovered}
                    onHover={setHovered}
                    onLeave={() => setHovered(0)}
                    onClick={setRating}
                  />
                ))}
              </div>
              <p className={`ru-star-label ${displayRating ? "ru-star-label--show" : ""}`}>
                {displayRating ? STAR_LABELS[displayRating] : " "}
              </p>
            </div>

            {/* Aspects */}
            <div className="ru-field">
              <label className="ru-label">
                What did you like?
                <span className="ru-label-optional">optional</span>
              </label>
              <div className="ru-aspects">
                {ASPECTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`ru-aspect-chip ${aspects.includes(a.id) ? "ru-aspect-chip--on" : ""}`}
                    onClick={() => toggleAspect(a.id)}
                  >
                    {aspects.includes(a.id) && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="ru-field">
              <label className="ru-label" htmlFor="ru-comment">
                Your review
                <span className="ru-label-optional">optional</span>
              </label>
              <textarea
                id="ru-comment"
                className="ru-textarea"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience — what went well, what could be better…"
                maxLength={1000}
              />
              <span className="ru-char-count">{comment.length}/1000</span>
            </div>

            {error && (
              <div className="ru-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="ru-submit" disabled={loading || rating === 0}>
              {loading ? (
                <><span className="ru-spinner" aria-hidden="true"/>Submitting…</>
              ) : (
                <>
                  Submit Review
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>

          </form>

          <p className="ru-footer-note">
            Already reviewed?{" "}
            <Link to="/used-cars">Browse cars</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
