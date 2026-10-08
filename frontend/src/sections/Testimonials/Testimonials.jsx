import React, { useEffect, useRef, useState } from "react";
import { reviewsAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./Testimonials.css";

/* ── static fallback (shown while loading or if API returns < 3) ── */
const STATIC = [
  {
    id: "s1",
    customer: { name: "Rahul Sharma" },
    rating: 5,
    comment:
      "Found my dream car within a week. The verification process gave me total peace of mind. No hidden fees, zero pressure.",
    createdAt: "2024-10-01",
  },
  {
    id: "s2",
    customer: { name: "Priya Menon" },
    rating: 5,
    comment:
      "Sold my car in just 3 days at a fair price. Payment was transferred instantly. Best selling experience I've ever had.",
    createdAt: "2024-09-18",
  },
  {
    id: "s3",
    customer: { name: "Arjun Nair" },
    rating: 5,
    comment:
      "Detailed history reports and 200-point inspection made all the difference. The car was exactly as described.",
    createdAt: "2024-09-05",
  },
  {
    id: "s4",
    customer: { name: "Sneha Pillai" },
    rating: 4,
    comment:
      "Great selection and transparent pricing. Financing options were competitive and delivery was on time.",
    createdAt: "2024-08-22",
  },
  {
    id: "s5",
    customer: { name: "Kiran Das" },
    rating: 5,
    comment:
      "The instant valuation tool was spot on. Got a better offer than any dealership quoted me. Truly hassle-free.",
    createdAt: "2024-08-10",
  },
];

const StarIcon = ({ filled }) => (
  <svg
    className={`t-star ${filled ? "t-star--filled" : ""}`}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const Stars = ({ rating }) => (
  <div className="t-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <StarIcon key={s} filled={s <= rating} />
    ))}
  </div>
);

/* ── initials avatar ── */
const Avatar = ({ name }) => {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  return <div className="t-avatar">{initials}</div>;
};

/* ── Write-a-Review modal ── */
const ReviewModal = ({ onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await reviewsAPI.createAppReview({ rating, comment });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* close on Escape */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="t-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="t-modal-title"
    >
      <div className="t-modal">
        <div className="t-modal-head">
          <h3 id="t-modal-title">Share Your Experience</h3>
          <button
            className="t-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="t-modal-form">
          <label className="t-modal-label">Your Rating *</label>
          <div className="t-modal-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                className={`t-modal-star ${
                  s <= (hovered || rating) ? "t-modal-star--on" : ""
                }`}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
                aria-label={`${s} star`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={s <= (hovered || rating) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
          </div>

          <label className="t-modal-label" htmlFor="t-comment">
            Your Review
          </label>
          <textarea
            id="t-comment"
            className="t-modal-textarea"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience with WheelzLoop…"
          />

          {error && <p className="t-modal-error">{error}</p>}

          <button type="submit" className="t-modal-submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const Testimonials = () => {
  const { isAuthenticated, isCustomer } = useAuth();

  const [items, setItems] = useState(STATIC);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const autoPlayRef = useRef(null);

  /* fetch top 5 app reviews */
  const fetchReviews = async () => {
    try {
      const res = await reviewsAPI.getTopAppReviews();
      if (res.ok) {
        const data = await res.json();
        if (data.reviews?.length >= 1) setItems(data.reviews);
      }
    } catch {
      /* keep static fallback */
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  /* responsive visible count */
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setVisibleCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const maxIndex = Math.max(0, items.length - visibleCount);

  useEffect(() => {
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
  }, [visibleCount, maxIndex, currentIndex]);

  /* autoplay */
  useEffect(() => {
    if (isPaused) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(autoPlayRef.current);
  }, [isPaused, maxIndex]);

  const goTo = (i) => setCurrentIndex(Math.max(0, Math.min(i, maxIndex)));

  const handleSubmitted = () => {
    setShowModal(false);
    setSubmitSuccess(true);
    fetchReviews(); // refresh to show the new review
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  /* avg rating from current items */
  const avgRating =
    items.length > 0
      ? (
          items.reduce((s, r) => s + Number(r.rating), 0) / items.length
        ).toFixed(1)
      : "4.9";

  return (
    <section className="t-section">
      <div className="t-container">
        {/* ── Header ── */}
        <div className="t-header">
          <span className="t-badge">Testimonials</span>
          <h2 className="t-title">What Our Customers Say</h2>
          <p className="t-subtitle">
            Thousands of happy buyers and sellers trust WheelzLoop for their
            used-car needs.
          </p>
          {/* Write a Review CTA */}
          {isAuthenticated && isCustomer && (
            <button className="t-write-btn" onClick={() => setShowModal(true)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Write a Review
            </button>
          )}
          {submitSuccess && (
            <p className="t-submit-success">
              ✓ Thank you! Your review has been submitted.
            </p>
          )}
        </div>

        {/* ── Carousel ── */}
        <div
          className="t-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button
            className="t-nav t-nav--prev"
            onClick={() => goTo(currentIndex - 1)}
            aria-label="Previous"
            disabled={currentIndex === 0}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="t-viewport">
            <div
              className="t-track"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / visibleCount)
                }%)`,
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="t-card"
                  style={{ flex: `0 0 ${100 / visibleCount}%` }}
                >
                  <div className="t-card-inner">
                    {/* quote icon */}
                    <div className="t-quote-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                      </svg>
                    </div>

                    <Stars rating={Number(item.rating)} />

                    <p className="t-comment">
                      {item.comment || "Great experience with WheelzLoop!"}
                    </p>

                    <div className="t-author">
                      <Avatar name={item.customer?.name} />
                      <div className="t-author-info">
                        <span className="t-author-name">
                          {item.customer?.name || "Anonymous"}
                        </span>
                        {item.createdAt && (
                          <span className="t-author-date">
                            {formatDate(item.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="t-nav t-nav--next"
            onClick={() => goTo(currentIndex + 1)}
            aria-label="Next"
            disabled={currentIndex === maxIndex}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* ── Dots ── */}
        <div className="t-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`t-dot ${i === currentIndex ? "t-dot--active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* ── Stats strip ── */}
        <div className="t-stats">
          <div className="t-stat">
            <span className="t-stat-value">{avgRating}</span>
            <span className="t-stat-label">Average Rating</span>
          </div>
          <div className="t-stat-divider" />
          <div className="t-stat">
            <span className="t-stat-value">12K+</span>
            <span className="t-stat-label">Happy Customers</span>
          </div>
          <div className="t-stat-divider" />
          <div className="t-stat">
            <span className="t-stat-value">98%</span>
            <span className="t-stat-label">Would Recommend</span>
          </div>
        </div>
      </div>

      {/* ── Write a Review Modal ── */}
      {showModal && (
        <ReviewModal
          onClose={() => setShowModal(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </section>
  );
};

export default Testimonials;
