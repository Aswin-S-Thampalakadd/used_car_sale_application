import React, { useEffect, useState } from "react";
import { reviewsAPI } from "../../api/api";
import "./DealerReviews.css";

/* ── helpers ── */
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const StarRow = ({ value }) => (
  <div className="dr-stars" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className={`dr-star ${s <= value ? "dr-star--on" : ""}`}
        viewBox="0 0 24 24"
        fill={s <= value ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

/* ── single review card ── */
const ReviewCard = ({ review, onDelete, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState(review.replyText || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) { setErr("Reply cannot be empty."); return; }
    setSaving(true); setErr("");
    try {
      await onReply(review.id, replyText.trim());
      setShowReplyForm(false);
    } catch (error) {
      setErr(error.message || "Failed to post reply.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dr-card">
      {/* ── top row ── */}
      <div className="dr-card-top">
        <div className="dr-avatar">
          {review.customer?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="dr-card-meta">
          <p className="dr-customer-name">
            {review.customer?.name || "Anonymous"}
          </p>
          <StarRow value={review.rating} />
          {review.car && (
            <p className="dr-car-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              {review.car.year} {review.car.make} {review.car.model}
            </p>
          )}
        </div>
        <span className="dr-date">{formatDate(review.createdAt)}</span>
      </div>

      {review.comment && (
        <p className="dr-comment">{review.comment}</p>
      )}

      {/* ── existing reply ── */}
      {review.replyText && !showReplyForm && (
        <div className="dr-reply-bubble">
          <div className="dr-reply-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Your reply · {formatDate(review.replyAt)}
          </div>
          <p className="dr-reply-text">{review.replyText}</p>
        </div>
      )}

      {/* ── reply form ── */}
      {showReplyForm && (
        <form className="dr-reply-form" onSubmit={handleReply}>
          <textarea
            className="dr-reply-textarea"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a professional reply to this customer…"
            rows={3}
            autoFocus
          />
          {err && <p className="dr-reply-err">{err}</p>}
          <div className="dr-reply-actions">
            <button
              type="button"
              className="dr-btn dr-btn--ghost"
              onClick={() => { setShowReplyForm(false); setReplyText(review.replyText || ""); setErr(""); }}
            >
              Cancel
            </button>
            <button type="submit" className="dr-btn dr-btn--primary" disabled={saving}>
              {saving ? "Posting…" : review.replyText ? "Update Reply" : "Post Reply"}
            </button>
          </div>
        </form>
      )}

      {/* ── card actions ── */}
      <div className="dr-card-actions">
        <button
          type="button"
          className="dr-btn dr-btn--outline"
          onClick={() => { setShowReplyForm((v) => !v); setErr(""); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {review.replyText ? "Edit Reply" : "Reply"}
        </button>

        <button
          type="button"
          className="dr-btn dr-btn--danger"
          onClick={() => onDelete(review.id)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN  COMPONENT
═══════════════════════════════════════════════════════════ */
const DealerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: null, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | replied | pending

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await reviewsAPI.getDealerReviews();
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reviews");
      setReviews(data.reviews || []);
      setSummary({ averageRating: data.averageRating, totalReviews: data.totalReviews });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ── reply handler ── */
  const handleReply = async (reviewId, replyText) => {
    const res = await reviewsAPI.replyToReview(reviewId, replyText);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to post reply");
    // update inline
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, replyText: data.review.replyText, replyAt: data.review.replyAt }
          : r
      )
    );
  };

  /* ── delete handler ── */
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Remove this review from your profile?")) return;
    try {
      const res = await reviewsAPI.dealerDeleteReview(reviewId);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message);
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setSummary((prev) => ({
        ...prev,
        totalReviews: Math.max(0, prev.totalReviews - 1),
      }));
    } catch (err) {
      alert(err.message || "Failed to delete review");
    }
  };

  /* ── filtered list ── */
  const filtered = reviews.filter((r) => {
    if (filter === "replied") return !!r.replyText;
    if (filter === "pending") return !r.replyText;
    return true;
  });

  /* ── rating distribution ── */
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  if (loading) return (
    <div className="dr-loading">
      <div className="dash-spinner" />
      <span>Loading reviews…</span>
    </div>
  );

  if (error) return (
    <div className="dr-error" role="alert">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {error}
      <button onClick={load}>Retry</button>
    </div>
  );

  return (
    <div className="dr-root">
      {/* ── Summary strip ── */}
      <div className="dr-summary">
        <div className="dr-summary-score">
          <span className="dr-score-big">
            {summary.averageRating ? Number(summary.averageRating).toFixed(1) : "—"}
          </span>
          <div className="dr-score-right">
            {summary.averageRating && (
              <StarRow value={Math.round(summary.averageRating)} />
            )}
            <span className="dr-score-count">
              {summary.totalReviews} review{summary.totalReviews !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* rating distribution bars */}
        {reviews.length > 0 && (
          <div className="dr-dist">
            {dist.map(({ star, count }) => (
              <div key={star} className="dr-dist-row">
                <span className="dr-dist-label">{star}★</span>
                <div className="dr-dist-bar">
                  <div
                    className="dr-dist-fill"
                    style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                  />
                </div>
                <span className="dr-dist-count">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="dr-filter-tabs">
        {[
          { key: "all",     label: "All",           count: reviews.length },
          { key: "pending", label: "Needs Reply",    count: reviews.filter((r) => !r.replyText).length },
          { key: "replied", label: "Replied",        count: reviews.filter((r) => !!r.replyText).length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            className={`dr-tab ${filter === key ? "dr-tab--active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
            <span className="dr-tab-count">{count}</span>
          </button>
        ))}
      </div>

      {/* ── Review list ── */}
      {filtered.length === 0 ? (
        <div className="dr-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>
            {filter === "pending"
              ? "No reviews waiting for a reply."
              : filter === "replied"
              ? "You haven't replied to any reviews yet."
              : "No reviews yet. They'll appear here once customers leave feedback."}
          </p>
        </div>
      ) : (
        <div className="dr-list">
          {filtered.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DealerReviews;
