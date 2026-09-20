import React, { useState, useMemo } from "react";
import "./CarDetails.css";

const car = {
  id: 1,
  dealerId: 3,
  make: "Toyota",
  model: "Fortuner",
  variant: "2.8 4x2 AT",
  year: 2021,
  registrationYear: 2021,
  fuelType: "diesel",
  transmission: "automatic",
  kilometersDriven: 42000,
  price: "3450000.00",
  color: "White",
  condition: "excellent",
  description:
    "Well-maintained Toyota Fortuner with automatic transmission and excellent service history.",
  registrationNumber: "KL07AB1234",
  isNegotiable: true,
  status: "active",
  isFeatured: true,
  viewsCount: 125,
  createdAt: "2026-09-19T05:58:16.883Z",
  updatedAt: "2026-09-19T05:58:16.883Z",
  dealer: {
    id: 3,
    name: "Dealer",
    email: "dealer@gmail.com",
    phone: "9000000003",
    profileImage: null,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
  },
  carImages: [
    {
      id: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      id: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200",
      sortOrder: 1,
      isPrimary: false,
    },
    {
      id: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
      sortOrder: 2,
      isPrimary: false,
    },
  ],
  carFeatureMappings: [
    { featureId: 1, feature: { id: 1, name: "Air Conditioning" } },
    { featureId: 2, feature: { id: 2, name: "Power Steering" } },
    { featureId: 3, feature: { id: 3, name: "Power Windows" } },
    { featureId: 4, feature: { id: 4, name: "Central Locking" } },
    { featureId: 5, feature: { id: 5, name: "Airbags" } },
    { featureId: 6, feature: { id: 6, name: "ABS" } },
    { featureId: 7, feature: { id: 7, name: "Rear Parking Camera" } },
    { featureId: 8, feature: { id: 8, name: "Parking Sensors" } },
    { featureId: 9, feature: { id: 9, name: "Bluetooth" } },
    { featureId: 12, feature: { id: 12, name: "Cruise Control" } },
    { featureId: 14, feature: { id: 14, name: "Alloy Wheels" } },
    { featureId: 15, feature: { id: 15, name: "Keyless Entry" } },
    { featureId: 16, feature: { id: 16, name: "Push Button Start" } },
  ],
};

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatKm = (km) => `${Number(km).toLocaleString("en-IN")} km`;

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const conditionLabel = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

const CarDetails = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const images = useMemo(
    () => [...car.carImages].sort((a, b) => a.sortOrder - b.sortOrder),
    []
  );

  const features = useMemo(
    () => car.carFeatureMappings.map((f) => f.feature.name),
    []
  );

  const title = `${car.year} ${car.make} ${car.model}`;
  const subtitle = car.variant;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const openLightbox = (idx) => {
    setActiveImage(idx);
    setLightboxOpen(true);
  };

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="car-details">
      <div className="car-details-container">
        <nav className="car-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true">/</span>
          <a href="/used-cars">Used Cars</a>
          <span aria-hidden="true">/</span>
          <a href={`/used-cars/brand/${car.make.toLowerCase()}`}>{car.make}</a>
          <span aria-hidden="true">/</span>
          <a
            href={`/used-cars/brand/${car.make.toLowerCase()}/${car.model.toLowerCase()}`}
          >
            {car.model}
          </a>
          <span aria-hidden="true">/</span>
          <span className="car-breadcrumb-current">{car.year}</span>
        </nav>

        <div className="car-hero">
          <div className="car-gallery">
            <div
              className="car-gallery-main"
              onClick={() => openLightbox(activeImage)}
            >
              <img
                src={images[activeImage]?.imageUrl}
                alt={`${title} ${subtitle} - view ${activeImage + 1}`}
                loading="eager"
              />

              <div className="car-gallery-badges">
                {car.isFeatured && (
                  <span className="car-badge car-badge-featured">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                    </svg>
                    Featured
                  </span>
                )}
                <span className="car-badge car-badge-condition">
                  {conditionLabel[car.condition] || car.condition}
                </span>
              </div>

              <span className="car-gallery-count">
                {activeImage + 1} / {images.length}
              </span>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="car-gallery-arrow car-gallery-arrow-prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    aria-label="Previous image"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="car-gallery-arrow car-gallery-arrow-next"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    aria-label="Next image"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div
                className="car-gallery-thumbs"
                role="tablist"
                aria-label="Image thumbnails"
              >
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === activeImage}
                    className={`car-gallery-thumb ${
                      idx === activeImage ? "active" : ""
                    }`}
                    onClick={() => setActiveImage(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img.imageUrl} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="car-summary">
            <div className="car-summary-header">
              <div className="car-summary-title-row">
                <h1 className="car-title">
                  {title}
                  <span className="car-title-variant"> {subtitle}</span>
                </h1>
                <button
                  type="button"
                  className="car-share-btn"
                  onClick={handleCopyLink}
                  aria-label="Copy link to this car"
                  title="Copy link"
                >
                  {copied ? (
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
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="car-meta-row">
                <span className="car-meta-item">
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
                  {car.registrationNumber}
                </span>
                <span className="car-meta-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {car.viewsCount} views
                </span>
                <span className="car-meta-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Listed {formatDate(car.createdAt)}
                </span>
              </div>
            </div>

            <div className="car-price-block">
              <div className="car-price">{formatPrice(car.price)}</div>
              {car.isNegotiable && (
                <span className="car-negotiable">Negotiable</span>
              )}
            </div>

            <div className="car-quick-specs">
              <div className="car-quick-spec">
                <span className="car-quick-spec-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <span className="car-quick-spec-value">
                  {formatKm(car.kilometersDriven)}
                </span>
                <span className="car-quick-spec-label">Driven</span>
              </div>
              <div className="car-quick-spec">
                <span className="car-quick-spec-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 22h18" />
                    <path d="M5 22V8l7-5 7 5v14" />
                    <path d="M9 22v-6h6v6" />
                  </svg>
                </span>
                <span className="car-quick-spec-value">2021</span>
                <span className="car-quick-spec-label">Year</span>
              </div>
              <div className="car-quick-spec">
                <span className="car-quick-spec-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m7 14 4-4 4 4 5-6" />
                  </svg>
                </span>
                <span className="car-quick-spec-value">Diesel</span>
                <span className="car-quick-spec-label">Fuel</span>
              </div>
              <div className="car-quick-spec">
                <span className="car-quick-spec-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08 4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08 4.24-4.24" />
                  </svg>
                </span>
                <span className="car-quick-spec-value">Automatic</span>
                <span className="car-quick-spec-label">Transmission</span>
              </div>
            </div>

            <div className="car-actions">
              <button type="button" className="car-btn car-btn-primary">
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
                Contact Dealer
              </button>
              <button type="button" className="car-btn car-btn-secondary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Save
              </button>
            </div>
          </aside>
        </div>

        <div className="car-content">
          <div className="car-content-main">
            <section className="car-section">
              <h2 className="car-section-title">Overview</h2>
              <div className="car-spec-grid">
                <div className="car-spec">
                  <span className="car-spec-label">Make</span>
                  <span className="car-spec-value">{car.make}</span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Model</span>
                  <span className="car-spec-value">{car.model}</span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Variant</span>
                  <span className="car-spec-value">{car.variant}</span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Year</span>
                  <span className="car-spec-value">{car.year}</span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Registration Year</span>
                  <span className="car-spec-value">{car.registrationYear}</span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Registration No.</span>
                  <span className="car-spec-value">
                    {car.registrationNumber}
                  </span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Fuel Type</span>
                  <span className="car-spec-value car-spec-cap">
                    {car.fuelType}
                  </span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Transmission</span>
                  <span className="car-spec-value car-spec-cap">
                    {car.transmission}
                  </span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Kilometers Driven</span>
                  <span className="car-spec-value">
                    {formatKm(car.kilometersDriven)}
                  </span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Color</span>
                  <span className="car-spec-value">{car.color}</span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Condition</span>
                  <span className="car-spec-value car-spec-cap">
                    {conditionLabel[car.condition] || car.condition}
                  </span>
                </div>
                <div className="car-spec">
                  <span className="car-spec-label">Status</span>
                  <span className="car-spec-value car-spec-cap">
                    {car.status}
                  </span>
                </div>
              </div>
            </section>

            <section className="car-section">
              <h2 className="car-section-title">Description</h2>
              <p className="car-description">{car.description}</p>
            </section>

            <section className="car-section">
              <h2 className="car-section-title">
                Features{" "}
                <span className="car-section-count">{features.length}</span>
              </h2>
              <ul className="car-features">
                {features.map((name) => (
                  <li key={name} className="car-feature">
                    <span className="car-feature-icon" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {name}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="car-content-side">
            <section className="car-dealer-card">
              <h2 className="car-section-title">Dealer</h2>
              <div className="car-dealer-head">
                <div className="car-dealer-avatar" aria-hidden="true">
                  {car.dealer.name.charAt(0).toUpperCase()}
                </div>
                <div className="car-dealer-info">
                  <span className="car-dealer-name">{car.dealer.name}</span>
                  <span className="car-dealer-meta">
                    {car.dealer.emailVerified && (
                      <span className="car-dealer-verified">
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
                        Verified
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <ul className="car-dealer-contact">
                <li>
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
                  <a href={`tel:${car.dealer.phone}`}>{car.dealer.phone}</a>
                </li>
                <li>
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
                  <a href={`mailto:${car.dealer.email}`}>{car.dealer.email}</a>
                </li>
              </ul>

              <button type="button" className="car-dealer-cta">
                View all listings
              </button>
            </section>

            <section className="car-safety-card">
              <h3 className="car-safety-title">Buy with confidence</h3>
              <ul className="car-safety-list">
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Verified dealer
                </li>
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Full history report
                </li>
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Free inspection
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="car-lightbox"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            type="button"
            className="car-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close preview"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button
            type="button"
            className="car-lightbox-arrow car-lightbox-arrow-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            aria-label="Previous image"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <img
            className="car-lightbox-image"
            src={images[activeImage]?.imageUrl}
            alt={`${title} enlarged view`}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            className="car-lightbox-arrow car-lightbox-arrow-next"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            aria-label="Next image"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <span className="car-lightbox-count">
            {activeImage + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default CarDetails;
