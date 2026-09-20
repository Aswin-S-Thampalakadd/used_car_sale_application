import React, { useState, useEffect, useRef } from "react";
import "./Testimonials.css";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Bought a 2021 Honda CR-V",
    location: "Austin, TX",
    rating: 5,
    avatar: "SM",
    text: "The entire process was seamless. I found my dream car within a week and the verification process gave me total peace of mind. No hidden fees, no pressure. Highly recommend!",
  },
  {
    id: 2,
    name: "James Rodriguez",
    role: "Sold a 2019 Ford F-150",
    location: "Denver, CO",
    rating: 5,
    avatar: "JR",
    text: "Sold my truck in just 3 days at a fair price. The inspection team was professional and the payment was transferred instantly. Best car selling experience I have ever had.",
  },
  {
    id: 3,
    name: "Emily Chen",
    role: "Bought a 2020 Tesla Model 3",
    location: "San Jose, CA",
    rating: 5,
    avatar: "EC",
    text: "I was nervous about buying a used EV online, but the detailed history reports and 200-point inspection made all the difference. The car was exactly as described.",
  },
  {
    id: 4,
    name: "Michael Thompson",
    role: "Bought a 2022 Toyota Camry",
    location: "Seattle, WA",
    rating: 4,
    avatar: "MT",
    text: "Great selection and transparent pricing. The financing options were competitive and the delivery was on time. Only wish there were more color options available.",
  },
  {
    id: 5,
    name: "Priya Patel",
    role: "Bought a 2021 BMW X3",
    location: "Chicago, IL",
    rating: 5,
    avatar: "PP",
    text: "From browsing to driving off the lot, everything was handled with utmost professionalism. The customer support team answered every question promptly.",
  },
  {
    id: 6,
    name: "David Okafor",
    role: "Sold a 2018 Chevrolet Malibu",
    location: "Atlanta, GA",
    rating: 5,
    avatar: "DO",
    text: "The instant valuation tool was spot on. Got a better offer than any dealership quoted me. The pickup was scheduled at my convenience. Truly hassle-free.",
  },
];

const StarIcon = ({ filled }) => (
  <svg
    className={`testimonial-star ${filled ? "filled" : ""}`}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const trackRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleCount(1);
      else if (width < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  useEffect(() => {
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
  }, [visibleCount, maxIndex, currentIndex]);

  useEffect(() => {
    if (isPaused) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(autoPlayRef.current);
  }, [isPaused, maxIndex]);

  const goTo = (index) => {
    if (index < 0) setCurrentIndex(maxIndex);
    else if (index > maxIndex) setCurrentIndex(0);
    else setCurrentIndex(index);
  };

  const goPrev = () => goTo(currentIndex - 1);
  const goNext = () => goTo(currentIndex + 1);

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <span className="testimonials-badge">Testimonials</span>
          <h2 className="testimonials-title">What Our Customers Say</h2>
          <p className="testimonials-subtitle">
            Thousands of happy buyers and sellers trust us for their used car
            needs.
          </p>
        </div>

        <div
          className="testimonials-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button
            className="testimonials-nav testimonials-nav-prev"
            onClick={goPrev}
            aria-label="Previous testimonials"
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

          <div className="testimonials-viewport">
            <div
              className="testimonials-track"
              ref={trackRef}
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / visibleCount)
                }%)`,
              }}
            >
              {testimonials.map((item) => (
                <div
                  className="testimonial-card"
                  key={item.id}
                  style={{ flex: `0 0 ${100 / visibleCount}%` }}
                >
                  <div className="testimonial-card-inner">
                    <div className="testimonial-quote-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                      </svg>
                    </div>

                    <div className="testimonial-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} filled={star <= item.rating} />
                      ))}
                    </div>

                    <p className="testimonial-text">{item.text}</p>

                    <div className="testimonial-author">
                      <div className="testimonial-avatar">{item.avatar}</div>
                      <div className="testimonial-author-info">
                        <span className="testimonial-name">{item.name}</span>
                        <span className="testimonial-role">{item.role}</span>
                        <span className="testimonial-location">
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
                          {item.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="testimonials-nav testimonials-nav-next"
            onClick={goNext}
            aria-label="Next testimonials"
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
        </div>

        <div className="testimonials-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`testimonials-dot ${
                index === currentIndex ? "active" : ""
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="testimonials-stats">
          <div className="testimonial-stat">
            <span className="testimonial-stat-value">4.9</span>
            <span className="testimonial-stat-label">Average Rating</span>
          </div>
          <div className="testimonial-stat-divider" />
          <div className="testimonial-stat">
            <span className="testimonial-stat-value">12K+</span>
            <span className="testimonial-stat-label">Happy Customers</span>
          </div>
          <div className="testimonial-stat-divider" />
          <div className="testimonial-stat">
            <span className="testimonial-stat-value">98%</span>
            <span className="testimonial-stat-label">Would Recommend</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
