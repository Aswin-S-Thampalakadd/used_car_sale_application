import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { carsAPI, enquiriesAPI, favouritesAPI, reviewsAPI } from "../../api/api";
import "./CarDetails.css";

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(num);
};

const formatKm = (km) => `${Number(km).toLocaleString("en-IN")} km`;

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

const conditionLabel = { excellent: "Excellent", good: "Good", fair: "Fair" };

const StarRating = ({ value, onChange, readonly = false, size = 20 }) => (
  <div className="star-rating" aria-label={`Rating: ${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type={readonly ? "button" : "button"}
        className={`star ${star <= value ? "star-filled" : "star-empty"}`}
        onClick={readonly ? undefined : () => onChange(star)}
        style={{ width: size, height: size, cursor: readonly ? "default" : "pointer" }}
        aria-label={`${star} star`}
        tabIndex={readonly ? -1 : 0}
      >
        <svg viewBox="0 0 24 24" fill={star <= value ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    ))}
  </div>
);

const CarDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, isCustomer, user } = useAuth();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Favourite
  const [isFavourite, setIsFavourite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Enquiry
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState("");
  const [enquiryError, setEnquiryError] = useState("");
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const loadCar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await carsAPI.getById(id);
      if (!res.ok) throw new Error("Car not found");
      const data = await res.json();
      setCar(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async () => {
    try {
      const res = await reviewsAPI.getByCar(id);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAvgRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch { /* non-critical */ }
  }, [id]);

  const checkFavourite = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await favouritesAPI.check(id);
      if (res.ok) {
        const data = await res.json();
        setIsFavourite(data.isFavourite);
      }
    } catch { /* non-critical */ }
  }, [id, isAuthenticated]);

  useEffect(() => {
    loadCar();
    loadReviews();
    checkFavourite();
  }, [loadCar, loadReviews, checkFavourite]);

  const images = useMemo(
    () => (car?.carImages ? [...car.carImages].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [car]
  );

  const features = useMemo(
    () => (car?.carFeatureMappings ? car.carFeatureMappings.map((f) => f.feature.name) : []),
    [car]
  );

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const handleFavourite = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setFavLoading(true);
    try {
      if (isFavourite) {
        await favouritesAPI.remove(id);
        setIsFavourite(false);
      } else {
        await favouritesAPI.add(id);
        setIsFavourite(true);
      }
    } catch { /* noop */ }
    setFavLoading(false);
  };

  const handleEnquiry = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate("/login"); return; }
    setEnquiryLoading(true);
    setEnquiryError("");
    setEnquirySuccess("");
    try {
      const res = await enquiriesAPI.create({
        carId: Number(id),
        message: enquiryMessage,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send enquiry");
      setEnquirySuccess("Enquiry sent! The dealer will contact you soon.");
      setEnquiryMessage("");
      setShowEnquiryForm(false);
    } catch (err) {
      setEnquiryError(err.message);
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate("/login"); return; }
    setReviewLoading(true);
    setReviewError("");
    setReviewSuccess("");
    try {
      const res = await reviewsAPI.create({
        carId: Number(id),
        rating: myRating,
        comment: myComment,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");
      setReviewSuccess("Review submitted!");
      setMyRating(0);
      setMyComment("");
      setShowReviewForm(false);
      loadReviews();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="car-details-loading">
        <div className="dash-spinner" />
        <p>Loading car details…</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="car-details-error">
        <h2>{error || "Car not found"}</h2>
        <button onClick={() => navigate("/used-cars")}>Browse cars</button>
      </div>
    );
  }

  const title = `${car.year} ${car.make} ${car.model}`;

  return (
    <div className="car-details">
      <div className="car-details-container">
        {/* Breadcrumb */}
        <nav className="car-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true">/</span>
          <a href="/used-cars">Used Cars</a>
          <span aria-hidden="true">/</span>
          <span className="car-breadcrumb-current">{title}</span>
        </nav>

        <div className="car-hero">
          {/* Gallery */}
          <div className="car-gallery">
            <div className="car-gallery-main" onClick={() => setLightboxOpen(true)}>
              {images[activeImage] ? (
                <img
                  src={images[activeImage].imageUrl}
                  alt={`${title} - view ${activeImage + 1}`}
                  loading="eager"
                />
              ) : (
                <div className="car-gallery-placeholder">No images available</div>
              )}

              <div className="car-gallery-badges">
                {car.isFeatured && (
                  <span className="car-badge car-badge-featured">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                    </svg>
                    Featured
                  </span>
                )}
                {car.condition && (
                  <span className="car-badge car-badge-condition">
                    {conditionLabel[car.condition] || car.condition}
                  </span>
                )}
              </div>

              {images.length > 0 && (
                <span className="car-gallery-count">{activeImage + 1} / {images.length}</span>
              )}

              {images.length > 1 && (
                <>
                  <button type="button" className="car-gallery-arrow car-gallery-arrow-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Previous image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <button type="button" className="car-gallery-arrow car-gallery-arrow-next" onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Next image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="car-gallery-thumbs" role="tablist">
                {images.map((img, idx) => (
                  <button key={img.id} type="button" role="tab" aria-selected={idx === activeImage}
                    className={`car-gallery-thumb ${idx === activeImage ? "active" : ""}`}
                    onClick={() => setActiveImage(idx)}>
                    <img src={img.imageUrl} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <aside className="car-summary">
            <div className="car-summary-header">
              <div className="car-summary-title-row">
                <h1 className="car-title">
                  {title}
                  {car.variant && <span className="car-title-variant"> {car.variant}</span>}
                </h1>
                <button type="button" className="car-share-btn" onClick={handleCopyLink} aria-label="Copy link">
                  {copied
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>}
                </button>
              </div>

              <div className="car-meta-row">
                {car.registrationNumber && (
                  <span className="car-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /></svg>
                    {car.registrationNumber}
                  </span>
                )}
                <span className="car-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  {car.viewsCount} views
                </span>
                <span className="car-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  {formatDate(car.createdAt)}
                </span>
              </div>

              {/* Rating summary */}
              {totalReviews > 0 && (
                <div className="car-rating-summary">
                  <StarRating value={Math.round(avgRating)} readonly size={16} onChange={() => {}} />
                  <span className="car-rating-avg">{avgRating?.toFixed(1)}</span>
                  <span className="car-rating-count">({totalReviews} review{totalReviews !== 1 ? "s" : ""})</span>
                </div>
              )}
            </div>

            <div className="car-price-block">
              <div className="car-price">{formatPrice(car.price)}</div>
              {car.isNegotiable && <span className="car-negotiable">Negotiable</span>}
            </div>

            <div className="car-quick-specs">
              <div className="car-quick-spec">
                <span className="car-quick-spec-value">{formatKm(car.kilometersDriven)}</span>
                <span className="car-quick-spec-label">Driven</span>
              </div>
              <div className="car-quick-spec">
                <span className="car-quick-spec-value">{car.year}</span>
                <span className="car-quick-spec-label">Year</span>
              </div>
              <div className="car-quick-spec">
                <span className="car-quick-spec-value" style={{ textTransform: "capitalize" }}>{car.fuelType}</span>
                <span className="car-quick-spec-label">Fuel</span>
              </div>
              <div className="car-quick-spec">
                <span className="car-quick-spec-value" style={{ textTransform: "capitalize" }}>{car.transmission}</span>
                <span className="car-quick-spec-label">Transmission</span>
              </div>
            </div>

            {/* Enquiry success */}
            {enquirySuccess && (
              <div className="car-enquiry-success" role="status">{enquirySuccess}</div>
            )}

            {/* Action buttons */}
            <div className="car-actions">
              <button
                type="button"
                className="car-btn car-btn-primary"
                onClick={() => {
                  if (!isAuthenticated) { navigate("/login"); return; }
                  setShowEnquiryForm((v) => !v);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Contact Dealer
              </button>
              <button
                type="button"
                className={`car-btn car-btn-secondary ${isFavourite ? "car-btn-saved" : ""}`}
                onClick={handleFavourite}
                disabled={favLoading}
                aria-label={isFavourite ? "Remove from saved" : "Save car"}
              >
                <svg viewBox="0 0 24 24" fill={isFavourite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {isFavourite ? "Saved" : "Save"}
              </button>
            </div>

            {/* Enquiry form inline */}
            {showEnquiryForm && (
              <form className="car-enquiry-form" onSubmit={handleEnquiry}>
                <label htmlFor="enq-msg" className="car-enquiry-label">Your message (optional)</label>
                <textarea
                  id="enq-msg"
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  placeholder="I'm interested in this car. Please contact me."
                  rows={3}
                  className="car-enquiry-textarea"
                />
                {enquiryError && <p className="car-enquiry-error">{enquiryError}</p>}
                <button type="submit" className="car-enquiry-submit" disabled={enquiryLoading}>
                  {enquiryLoading ? "Sending…" : "Send Enquiry"}
                </button>
              </form>
            )}
          </aside>
        </div>

        {/* Main content */}
        <div className="car-content">
          <div className="car-content-main">
            <section className="car-section">
              <h2 className="car-section-title">Overview</h2>
              <div className="car-spec-grid">
                {[
                  ["Make", car.make],
                  ["Model", car.model],
                  car.variant && ["Variant", car.variant],
                  ["Year", car.year],
                  car.registrationYear && ["Registration Year", car.registrationYear],
                  car.registrationNumber && ["Registration No.", car.registrationNumber],
                  ["Fuel Type", car.fuelType],
                  ["Transmission", car.transmission],
                  ["Kilometers Driven", formatKm(car.kilometersDriven)],
                  car.color && ["Color", car.color],
                  car.condition && ["Condition", conditionLabel[car.condition] || car.condition],
                  ["Status", car.status],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label} className="car-spec">
                    <span className="car-spec-label">{label}</span>
                    <span className="car-spec-value" style={{ textTransform: ["Fuel Type", "Transmission", "Condition", "Status"].includes(label) ? "capitalize" : "none" }}>{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {car.description && (
              <section className="car-section">
                <h2 className="car-section-title">Description</h2>
                <p className="car-description">{car.description}</p>
              </section>
            )}

            {features.length > 0 && (
              <section className="car-section">
                <h2 className="car-section-title">
                  Features <span className="car-section-count">{features.length}</span>
                </h2>
                <ul className="car-features">
                  {features.map((name) => (
                    <li key={name} className="car-feature">
                      <span className="car-feature-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                      {name}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Reviews section */}
            <section className="car-section">
              <div className="car-reviews-header">
                <h2 className="car-section-title">
                  Reviews <span className="car-section-count">{totalReviews}</span>
                </h2>
                {isCustomer && (
                  <button
                    className="car-write-review-btn"
                    onClick={() => setShowReviewForm((v) => !v)}
                  >
                    {showReviewForm ? "Cancel" : "Write a Review"}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form className="car-review-form" onSubmit={handleReview}>
                  <div className="car-review-form-rating">
                    <label>Your Rating *</label>
                    <StarRating value={myRating} onChange={setMyRating} size={28} />
                  </div>
                  <textarea
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    placeholder="Share your experience with this car…"
                    rows={3}
                    className="car-review-textarea"
                  />
                  {reviewError && <p className="car-review-error">{reviewError}</p>}
                  {reviewSuccess && <p className="car-review-success">{reviewSuccess}</p>}
                  <button type="submit" className="car-review-submit" disabled={reviewLoading || myRating === 0}>
                    {reviewLoading ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="car-no-reviews">No reviews yet. Be the first to review this car.</p>
              ) : (
                <ul className="car-reviews-list">
                  {reviews.map((review) => (
                    <li key={review.id} className="car-review-item">
                      <div className="car-review-top">
                        <div className="car-review-avatar">
                          {review.customer?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="car-review-name">{review.customer?.name || "Anonymous"}</p>
                          <StarRating value={review.rating} readonly size={14} onChange={() => {}} />
                        </div>
                        <span className="car-review-date">{formatDate(review.createdAt)}</span>
                      </div>
                      {review.comment && <p className="car-review-comment">{review.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Dealer sidebar */}
          <aside className="car-content-side">
            {car.dealer && (
              <section className="car-dealer-card">
                <h2 className="car-section-title">Dealer</h2>
                <div className="car-dealer-head">
                  <div className="car-dealer-avatar" aria-hidden="true">
                    {car.dealer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="car-dealer-info">
                    <span className="car-dealer-name">{car.dealer.name}</span>
                    {car.dealer.emailVerified && (
                      <span className="car-dealer-verified">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <ul className="car-dealer-contact">
                  {car.dealer.phone && (
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                      <a href={`tel:${car.dealer.phone}`}>{car.dealer.phone}</a>
                    </li>
                  )}
                  {car.dealer.email && (
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
                      <a href={`mailto:${car.dealer.email}`}>{car.dealer.email}</a>
                    </li>
                  )}
                </ul>
              </section>
            )}

            <section className="car-safety-card">
              <h3 className="car-safety-title">Buy with confidence</h3>
              <ul className="car-safety-list">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Verified dealer
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  Full history report
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  Free inspection
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div className="car-lightbox" onClick={() => setLightboxOpen(false)} role="dialog" aria-modal="true">
          <button type="button" className="car-lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close preview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          {images.length > 1 && (
            <button type="button" className="car-lightbox-arrow car-lightbox-arrow-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}
          <img className="car-lightbox-image" src={images[activeImage]?.imageUrl} alt={title} onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <button type="button" className="car-lightbox-arrow car-lightbox-arrow-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          )}
          <span className="car-lightbox-count">{activeImage + 1} / {images.length}</span>
        </div>
      )}
    </div>
  );
};

export default CarDetails;
